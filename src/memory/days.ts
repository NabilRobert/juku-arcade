/**
 * Days as the game counts them: local dates written YYYY-MM-DD. The
 * reviews, the streak, the calendar and the reports all step through days
 * with these, so date arithmetic lives in one place. Dates are handled as
 * midnight UTC, so a daylight-saving change can't skip or repeat a day.
 */

/** Milliseconds in a day. */
export const MS_PER_DAY = 86_400_000;

/** The local date `days` after `day`, both YYYY-MM-DD. */
export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Whole days from `fromDay` to `toDay`. */
export function daysBetween(fromDay: string, toDay: string): number {
  return Math.round(
    (Date.parse(`${toDay}T00:00:00Z`) - Date.parse(`${fromDay}T00:00:00Z`)) / MS_PER_DAY,
  );
}

/** The Monday that starts `day`'s week, YYYY-MM-DD. */
export function weekStartOf(day: string): string {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

/** The local date of an event: its `at` is local time with an offset, so the first 10 characters. */
export function localDayOf(at: string): string {
  return at.slice(0, 10);
}
