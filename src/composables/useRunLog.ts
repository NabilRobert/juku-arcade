/**
 * Records the run on screen in the play log (memory/play-log.ts). The
 * mode calls `record` with its numbers after each answer; the run is saved
 * from its first answer on, each save replacing the last, so a run counts
 * for its day even if the player just closes the game.
 */
import { localDay } from '../game/events.ts';
import type { PlayMode, PlayedRun, RunTally } from '../memory/play-log.ts';
import { saveRun } from '../memory/storage.ts';

export function useRunLog(mode: PlayMode) {
  let run: PlayedRun | null = null;

  function record(tally: RunTally): void {
    if (tally.answered === 0) return;
    const nowMs = Date.now();
    run ??= {
      id: crypto.randomUUID(),
      mode,
      day: localDay(new Date(nowMs)),
      startedAtMs: nowMs,
      lastPlayedAtMs: nowMs,
      ...tally,
    };
    run = { ...run, ...tally, lastPlayedAtMs: nowMs };
    // Storage can be blocked (a private window); the run then just isn't logged.
    saveRun(run).catch((error: unknown) => console.warn('Could not save the run:', error));
  }

  return { record };
}
