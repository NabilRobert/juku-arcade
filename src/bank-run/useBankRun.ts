/**
 * Runs the bank run (bank-run.ts) alongside a word-mode run. It
 * watches the run: each match adds to the pot, a combo that breaks (a miss
 * or a timeout) loses it, and each set that ends counts toward the round.
 * Banking ends the run's combo through `endCombo`. While the shop or the
 * end screen is open, `isHolding` asks useRun to hold the next set.
 */
import { computed, ref, shallowRef, watch, type Ref } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import type { RunState } from '../game/run.ts';
import { playSound } from '../sound/sfx.ts';
import {
  addMatch,
  bankPot,
  buyItem,
  endSet,
  losePot,
  nextRound,
  shouldBankAtBell,
  startBankRun,
  type BankRun,
} from './bank-run.ts';
import type { ItemId } from './items.ts';
import { useNotice } from '../composables/useNotice.ts';
import { useCrests } from './useCrests.ts';

const BEST_ROUND_KEY = 'juku-arcade:best-bank-round';

function readBestRound(): number {
  try {
    return Number(localStorage.getItem(BEST_ROUND_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function saveBestRound(round: number): void {
  try {
    localStorage.setItem(BEST_ROUND_KEY, String(round));
  } catch {
    // Storage can be blocked (a private window); the best round then lasts this visit.
  }
}

/** The best round any bank run reached in this browser. */
function useBestRound() {
  const bestRound = ref(readBestRound());
  return {
    bestRound,
    record: (round: number) => {
      if (round <= bestRound.value) return;
      bestRound.value = round;
      saveBestRound(round);
    },
  };
}

/** The shop and end screens' actions. */
function shopActions(run: Ref<BankRun>, reset: () => void) {
  return {
    buy: (id: ItemId) => {
      run.value = buyItem(run.value, id);
      playSound('pickUp');
    },
    leaveShop: () => {
      run.value = nextRound(run.value);
    },
    newRun: () => {
      run.value = startBankRun();
      reset();
    },
  };
}

/** What the bank run needs from the word run: ending the combo (banking) and pausing (scouting). */
export interface BankRunActions {
  endCombo: () => void;
  pause: () => void;
}

type Crests = ReturnType<typeof useCrests>;
type Notify = (text: string, isGood: boolean) => void;

/** The pot: banking it, losing it on a miss, filling it on a match, and closing a set's books. */
function usePot(
  state: () => RunState,
  run: Ref<BankRun>,
  setup: { endCombo: () => void; crests: Crests; notify: Notify; random: RandomSource },
) {
  const { endCombo, crests, notify, random } = setup;
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

  /** The end of a set counts toward the round, banking at the bell if that reaches the target. */
  function onSetEnd(): void {
    if (shouldBankAtBell(run.value)) bank();
    run.value = endSet(run.value, random);
  }

  return { bank, onPlay, onSetEnd };
}

export function useBankRun(
  state: () => RunState,
  actions: BankRunActions,
  random: RandomSource = Math.random,
) {
  const run = shallowRef<BankRun>(startBankRun());
  const { notice, notify } = useNotice();
  const best = useBestRound();
  const crests = useCrests(state, run, random, notify);
  const pot = usePot(state, run, { endCombo: actions.endCombo, crests, notify, random });

  watch(state, (now, before) => {
    if (now.setIndex !== before.setIndex) crests.deal(now);
    if (now.pausedAtMs === null) crests.isScouting.value = false;
    pot.onPlay(now, before);
    if (now.phase === 'playing' || before.phase !== 'playing') return;
    pot.onSetEnd();
    if (run.value.isOver) best.record(run.value.round);
  });

  return {
    run,
    notice,
    bestRound: best.bestRound,
    bank: pot.bank,
    shownCrests: crests.shownCrests,
    scout: () => {
      if (crests.scout()) actions.pause();
    },
    isHolding: computed(() => run.value.offer !== null || run.value.isOver),
    ...shopActions(run, () => (notice.value = null)),
  };
}
