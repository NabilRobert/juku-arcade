/**
 * Saves play time as an addition: each play clock (word mode's run, and
 * usePlayClock for the other modes) adds the time it counted since its
 * last save to today's saved total, rather than writing a total of its
 * own. A clock started from a total that was a few seconds out of date
 * (the next mode opening as the last one closes), or one closed without
 * a final save, used to lose up to PLAY_SAVE_EVERY_MS of play, so the
 * school's daily cap undercounted. Additions can't lose time.
 */
import { withPlayTime } from '../game/wellbeing.ts';
import { updateSavedSettings } from './storage.ts';

export interface PlayTimeSaver {
  /** Counts play not yet saved. */
  add: (playedMs: number) => void;
  /** Adds the unsaved play to today's saved total (on the clock's schedule, and when it stops). */
  flush: () => void;
}

export function playTimeSaver(today: () => string): PlayTimeSaver {
  let unsavedMs = 0;
  return {
    add: (playedMs) => {
      unsavedMs += playedMs;
    },
    flush: () => {
      if (unsavedMs === 0) return;
      const playedMs = unsavedMs;
      unsavedMs = 0;
      updateSavedSettings((saved) => withPlayTime(saved, today(), playedMs)).catch(
        (error: unknown) => console.warn('Could not save play time:', error),
      );
    },
  };
}
