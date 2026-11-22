/**
 * SPIKE: runs the bank run (bank-run.ts) alongside a word-mode run. It
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

/** A pot just lost, for the panel to show; the key makes each loss show afresh. */
export interface PotLoss {
  amount: number;
  key: number;
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
function shopActions(run: Ref<BankRun>, lastLoss: Ref<PotLoss | null>) {
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
      lastLoss.value = null;
    },
  };
}

export function useBankRun(
  state: () => RunState,
  endCombo: () => void,
  random: RandomSource = Math.random,
) {
  const run = shallowRef<BankRun>(startBankRun());
  const lastLoss = ref<PotLoss | null>(null);
  const best = useBestRound();
  /** Set while our own bank ends the combo, so that isn't taken for a miss. */
  let isBanking = false;

  function loseThePot(): void {
    const { run: next, lost } = losePot(run.value);
    run.value = next;
    if (lost > 0) lastLoss.value = { amount: lost, key: (lastLoss.value?.key ?? 0) + 1 };
  }

  watch(state, (now, before) => {
    if (now.combo > before.combo) run.value = addMatch(run.value, now.combo);
    if (now.combo === 0 && before.combo > 0 && !isBanking) loseThePot();
    isBanking = false;
    if (now.phase === 'playing' || before.phase !== 'playing') return;
    if (shouldBankAtBell(run.value)) bank();
    run.value = endSet(run.value, random);
    if (run.value.isOver) best.record(run.value.round);
  });

  function bank(): void {
    if (run.value.pot <= 0) return;
    run.value = bankPot(run.value);
    playSound('cleared');
    if (state().combo === 0) return;
    isBanking = true;
    endCombo();
  }

  return {
    run,
    lastLoss,
    bestRound: best.bestRound,
    bank,
    isHolding: computed(() => run.value.offer !== null || run.value.isOver),
    ...shopActions(run, lastLoss),
  };
}
