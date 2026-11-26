/**
 * The streak (playtest decision, 2026-11-26): days in a row with a run played, in any
 * mode, however it ended (play-log.ts). It works on loss aversion: a
 * streak is something to lose (Kahneman & Tversky 1979). To keep that from
 * punishing a busy day, one missed day a calendar week (Monday to Sunday)
 * is a rest day: it doesn't break the streak, though it doesn't count
 * toward it either. A second missed day in the same week breaks it.
 *
 * Today never breaks the streak: the player still has until midnight.
 */
import { addDays, weekStartOf } from './days.ts';

export interface Streak {
  /** Days played in the streak, not counting rest days. */
  days: number;
  /** The missed days the streak forgave, newest first. */
  restDays: string[];
  isTodayPlayed: boolean;
}

const NO_STREAK: Streak = { days: 0, restDays: [], isTodayPlayed: false };

function earliestOf(days: ReadonlySet<string>): string | null {
  let earliest: string | null = null;
  for (const day of days) if (earliest === null || day < earliest) earliest = day;
  return earliest;
}

export function streakOn(playedDays: ReadonlySet<string>, today: string): Streak {
  const earliest = earliestOf(playedDays);
  if (earliest === null) return NO_STREAK;
  const isTodayPlayed = playedDays.has(today);
  const restWeeks = new Set<string>();
  const restDays: string[] = [];
  let days = 0;
  let oldestPlayed = today;
  for (let day = isTodayPlayed ? today : addDays(today, -1); day >= earliest;) {
    if (playedDays.has(day)) {
      days += 1;
      oldestPlayed = day;
    } else {
      const week = weekStartOf(day);
      if (restWeeks.has(week)) break;
      restWeeks.add(week);
      restDays.push(day);
    }
    day = addDays(day, -1);
  }
  // A rest day older than every day played in the streak bridges nothing.
  const bridging = days === 0 ? [] : restDays.filter((day) => day > oldestPlayed);
  return { days, restDays: bridging, isTodayPlayed };
}
