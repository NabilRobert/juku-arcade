/**
 * The crests on a bank run's word cards (crests.ts): which cards
 * carry one this set, scouting (a limited pause that shows them), and what
 * a marked card does when it's matched or missed. useBankRun calls these
 * from its watch on the run.
 */
import { computed, ref, shallowRef, type Ref } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import type { RunState } from '../game/run.ts';
import { addCoins, takeCoins, useScout, type BankRun } from './bank-run.ts';
import { CRESTS, CURSE_COST, dealCrests, drawOmikuji, type CrestKind } from './crests.ts';

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
      run.value = useScout(run.value);
      isScouting.value = true;
      isRevealed.value = true;
      return true;
    },
  };
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
    if (crest === 'koban') notify(`${CRESTS.koban.symbol} Koban! Double coins`, true);
    if (crest !== 'omikuji') return crest === 'koban' ? 2 : 1;
    const gift = drawOmikuji(random);
    run.value = addCoins(run.value, gift.to, gift.coins);
    const where = gift.to === 'pot' ? 'to the pot' : 'banked';
    notify(`${CRESTS.omikuji.symbol} Omikuji: +${gift.coins} ${where}`, true);
    return 1;
  }

  /** A miss on a cursed card also costs banked coins. */
  function onMiss(wordId: string): void {
    if (crests.value.get(wordId) !== 'cursed') return;
    run.value = takeCoins(run.value, CURSE_COST);
    notify(`${CRESTS.cursed.symbol} Cursed! −${CURSE_COST} coins`, false);
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
