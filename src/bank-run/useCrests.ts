/**
 * The crests on a bank run's word cards (crests.ts): which cards
 * carry one this set, scouting (a limited pause that shows them), and what
 * a marked card does when it's matched or missed. useBankRun calls these
 * from its watch on the run. Its notices are translated as they happen.
 */
import { computed, ref, shallowRef, type Ref } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import type { RunState } from '../game/run.ts';
import { addCoins, takeCoins, spendScout, type BankRun } from './bank-run.ts';
import {
  CRESTS,
  CURSE_COST,
  dealCrests,
  drawOmikuji,
  type CrestKind,
  type OmikujiGift,
} from './crests.ts';

import { translate } from '../i18n/index.ts';

type Notify = (text: string, isGood: boolean) => void;

/** Scouting: a limited pause that shows the crests (the caller pauses the game). */
export function useScouting(state: () => RunState, run: Ref<BankRun>) {
  const isScouting = ref(false);
  /** True from a scout until the next set: the scouted crests stay marked on the cards. */
  const isRevealed = ref(false);
  return {
    isScouting,
    isRevealed,
    /** Starts a scout if one is left and the set is in play; returns whether it did. */
    scout: (): boolean => {
      const now = state();
      const canScout =
        run.value.scoutsLeft > 0 && now.phase === 'playing' && now.pausedAtMs === null;
      if (!canScout) return false;
      run.value = spendScout(run.value);
      isScouting.value = true;
      isRevealed.value = true;
      return true;
    },
  };
}

/** What a koban or a cursed card says as it pays out or costs, in the interface language. */
function crestNotice(kind: 'koban' | 'cursed'): string {
  const symbol = CRESTS[kind].symbol;
  if (kind === 'koban') return translate('game.notices.koban', { symbol });
  return translate('game.notices.cursed', { symbol, cost: CURSE_COST });
}

/** What an omikuji's gift says, in the interface language. */
function omikujiNotice(gift: OmikujiGift): string {
  const message = gift.to === 'pot' ? 'game.notices.omikujiPot' : 'game.notices.omikujiBanked';
  return translate(message, { symbol: CRESTS.omikuji.symbol, coins: gift.coins });
}

export function useCrests(
  state: () => RunState,
  run: Ref<BankRun>,
  random: RandomSource,
  notify: Notify,
) {
  const crests = shallowRef<Map<string, CrestKind>>(new Map());
  const scouting = useScouting(state, run);

  function deal(now: RunState): void {
    const missedBefore = new Set(now.missedTray.map((word) => word.id));
    crests.value = dealCrests(now.set.words, missedBefore, random);
    scouting.isRevealed.value = false;
  }
  deal(state());

  /** A marked card matched right: the koban doubles its coins (the caller adds them), the omikuji gives a gift. */
  function multiplierFor(wordId: string | undefined): number {
    const crest = wordId === undefined ? undefined : crests.value.get(wordId);
    if (crest === 'koban') notify(crestNotice('koban'), true);
    if (crest !== 'omikuji') return crest === 'koban' ? 2 : 1;
    const gift = drawOmikuji(random);
    run.value = addCoins(run.value, gift.to, gift.coins);
    notify(omikujiNotice(gift), true);
    return 1;
  }

  /** A miss on a cursed card also costs banked coins. */
  function onMiss(wordId: string): void {
    if (crests.value.get(wordId) !== 'cursed') return;
    run.value = takeCoins(run.value, CURSE_COST);
    notify(crestNotice('cursed'), false);
  }

  return {
    deal,
    multiplierFor,
    onMiss,
    ...scouting,
    /** The crests to draw: from a scout until the set ends. */
    shownCrests: computed(() =>
      scouting.isRevealed.value ? crests.value : new Map<string, CrestKind>(),
    ),
  };
}
