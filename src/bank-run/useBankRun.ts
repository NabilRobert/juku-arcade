/**
 * Runs the bank run (bank-run.ts) alongside a word-mode run. It watches
 * the run: each match adds to the pot, a combo that breaks (a miss or a
 * timeout) loses it, and each set that ends may bring the shop. Banking
 * ends the run's combo through `endCombo`. Opening the shop pauses the
 * game, and leaving it resumes play.
 */
import { ref, shallowRef, watch, type Ref } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import type { RunState } from '../game/run.ts';
import { playSound } from '../sound/sfx.ts';
import {
  addMatch,
  bankPot,
  buyItem,
  closeShop,
  endSet,
  losePot,
  openShop,
  startBankRun,
  type BankRun,
} from './bank-run.ts';
import type { ItemId } from './items.ts';
import { useNotice } from '../composables/useNotice.ts';
import { useCrests } from './useCrests.ts';

const BEST_SCORE_KEY = 'juku-arcade:best-bank-score';

/** The best score (banked coins) reached in this browser, for the stats and the leaderboard. */
export function readBestScore(): number {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function saveBestScore(score: number): void {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // Storage can be blocked (a private window); the best score then lasts this visit.
  }
}

function useBestScore() {
  const bestScore = ref(readBestScore());
  return {
    bestScore,
    record: (score: number) => {
      if (score <= bestScore.value) return;
      bestScore.value = score;
      saveBestScore(score);
    },
  };
}

/** What the bank run needs from the word run: ending the combo (banking), and pausing (scouting, the shop). */
export interface BankRunActions {
  endCombo: () => void;
  pause: () => void;
  resume: () => void;
}

/** The shop's actions: opening it pauses the game, leaving it resumes play. */
function shopActions(run: Ref<BankRun>, actions: BankRunActions) {
  return {
    openShop: () => {
      if (run.value.shop !== 'here') return;
      run.value = openShop(run.value);
      actions.pause();
    },
    buy: (id: ItemId) => {
      run.value = buyItem(run.value, id);
      playSound('pickUp');
    },
    closeShop: () => {
      if (run.value.shop !== 'open') return;
      run.value = closeShop(run.value);
      actions.resume();
    },
  };
}

type Crests = ReturnType<typeof useCrests>;
type Notify = (text: string, isGood: boolean) => void;

/** The pot: banking it, losing it on a miss, and filling it on a match. */
function usePot(
  state: () => RunState,
  run: Ref<BankRun>,
  setup: { endCombo: () => void; crests: Crests; notify: Notify },
) {
  const { endCombo, crests, notify } = setup;
  /** Set while our own bank ends the combo, so that isn't taken for a miss. */
  let isBanking = false;

  function bank(): void {
    if (run.value.pot <= 0) return;
    run.value = bankPot(run.value);
    playSound('cleared');
    if (state().combo === 0) return;
    isBanking = true;
    endCombo();
  }

  /** A match, a miss or a banked combo: the pot and the crests answer. */
  function onPlay(now: RunState, before: RunState): void {
    if (now.combo > before.combo) {
      const matched = now.matchedWordIds.find((id) => !before.matchedWordIds.includes(id));
      run.value = addMatch(run.value, now.combo, crests.multiplierFor(matched));
    }
    if (now.combo === 0 && before.combo > 0 && !isBanking) {
      const { run: next, lost } = losePot(run.value);
      run.value = next;
      if (lost > 0) notify(`−${lost} lost!`, false);
    }
    isBanking = false;
    if (now.flash !== null && now.flash !== before.flash) crests.onMiss(now.flash.wordId);
  }

  return { bank, onPlay };
}

export function useBankRun(
  state: () => RunState,
  actions: BankRunActions,
  random: RandomSource = Math.random,
) {
  const run = shallowRef<BankRun>(startBankRun());
  const { notice, notify } = useNotice();
  const best = useBestScore();
  const crests = useCrests(state, run, random, notify);
  const pot = usePot(state, run, { endCombo: actions.endCombo, crests, notify });

  watch(state, (now, before) => {
    if (now.setIndex !== before.setIndex) crests.deal(now);
    if (now.pausedAtMs === null) crests.isScouting.value = false;
    // Resuming with Esc while the shop is open leaves the shop too.
    if (now.pausedAtMs === null && run.value.shop === 'open') run.value = closeShop(run.value);
    pot.onPlay(now, before);
    if (now.phase !== 'playing' && before.phase === 'playing')
      run.value = endSet(run.value, random);
  });
  watch(() => run.value.coins, best.record);

  return {
    run,
    notice,
    bestScore: best.bestScore,
    bank: pot.bank,
    shownCrests: crests.shownCrests,
    scout: () => {
      if (crests.scout()) actions.pause();
    },
    ...shopActions(run, actions),
  };
}
