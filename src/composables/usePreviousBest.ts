/**
 * The player's best run in a mode before this one, for the results card's
 * comparison (best-comparison.ts). Read from the play log when the mode
 * opens, before this run's first answer is logged, so the run can't
 * compare with itself. A best kept from before the play log existed
 * (`legacyBest`, word mode's coins) counts too.
 */
import { onMounted, ref } from 'vue';
import type { PlayMode } from '../memory/play-log.ts';
import { loadRuns } from '../memory/storage.ts';

export function usePreviousBest(mode: PlayMode, legacyBest: () => number = () => 0) {
  const best = ref(legacyBest());
  onMounted(async () => {
    try {
      const runs = await loadRuns();
      const scores = runs.filter((run) => run.mode === mode).map((run) => run.score);
      best.value = Math.max(best.value, ...scores);
    } catch {
      // Storage can be blocked (a private window); the comparison then uses the older best alone.
    }
  });
  return best;
}
