/**
 * Wellbeing rules (W1, W2, decision D19): a friendly nudge to stop after 15
 * and 30 minutes of play, and, if the school says minors play, a daily cap
 * set in the deploy's configuration. Play time counts only while the game
 * isn't paused or hidden.
 */

/** W1: minutes of play in one sitting after which the game suggests stopping. */
export const NUDGE_MINUTES = [15, 30] as const;

const MS_PER_MINUTE = 60_000;

/** The nudge to show now, in minutes, or null: the first threshold passed and not yet shown. */
export function dueNudge(sessionPlayMs: number, shownNudges: readonly number[]): number | null {
  const due = NUDGE_MINUTES.find(
    (minutes) => sessionPlayMs >= minutes * MS_PER_MINUTE && !shownNudges.includes(minutes),
  );
  return due ?? null;
}

/** W2: true once today's play reaches the cap. No cap (null) means never. */
export function isOverDailyCap(playMsToday: number, capMinutes: number | null): boolean {
  return capMinutes !== null && playMsToday >= capMinutes * MS_PER_MINUTE;
}

export interface PlayTime {
  playDay: string | null;
  playMsToday: number;
}

/** Adds play time to today's total, starting over on a new local day. */
export function withPlayTime<T extends PlayTime>(record: T, today: string, playedMs: number): T {
  const startOfDay = record.playDay === today ? record.playMsToday : 0;
  return { ...record, playDay: today, playMsToday: startOfDay + playedMs };
}

/** Reads the cap from the deploy's configuration: a positive whole number of minutes, or none. */
export function parseCapMinutes(raw: string | undefined): number | null {
  const minutes = Number.parseInt(raw ?? '', 10);
  return Number.isInteger(minutes) && minutes > 0 ? minutes : null;
}
