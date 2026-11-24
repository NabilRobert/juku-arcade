/**
 * Ending a Bunpou run (D59): keeps the run's score if it's your best,
 * picks the haiku that closes the show (haiku.ts) from the last tale's
 * setting and adds it to the collection, then steps from the curtain
 * call to the results.
 */
import { computed, ref, shallowRef } from 'vue';
import type { RandomSource } from '../game/deal.ts';
import {
  BUNPOU_SAMPLE_PLAYERS,
  rankedPlayers,
  readBunpouBest,
  recordBunpouBest,
} from '../leaderboard/leaderboard.ts';
import type { BunpouRun } from './bunpou-run.ts';
import { HAIKU_BANK } from './haiku-bank.ts';
import { loadHaikuShelf, pickHaiku, saveHaikuShelf, type HaikuPick } from './haiku.ts';

export type EndStep = 'playing' | 'curtain' | 'results';

export function useRunEnd(random: RandomSource = Math.random) {
  const step = ref<EndStep>('playing');
  const pick = shallowRef<HaikuPick | null>(null);
  const best = ref(readBunpouBest());
  const isNewBest = ref(false);

  function end(run: BunpouRun): void {
    if (step.value !== 'playing') return;
    isNewBest.value = recordBunpouBest(run.score);
    best.value = readBunpouBest();
    const settingWords = Object.values(run.tale.setting).map((noun) => noun.word);
    pick.value = pickHaiku(loadHaikuShelf(), settingWords, random);
    saveHaikuShelf(pick.value.shelf);
    step.value = 'curtain';
  }

  /** Your place on the Bunpou board with your best run. */
  const rank = computed(
    () =>
      rankedPlayers(best.value, BUNPOU_SAMPLE_PLAYERS).find((row) => row.isYou)?.rank ??
      BUNPOU_SAMPLE_PLAYERS.length + 1,
  );

  return {
    step,
    pick,
    best,
    isNewBest,
    rank,
    haikuTotal: HAIKU_BANK.length,
    end,
    showResults: () => {
      step.value = 'results';
    },
  };
}
