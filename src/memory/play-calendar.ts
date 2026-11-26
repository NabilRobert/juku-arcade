/**
 * The play calendar on the start screen, laid out like a contribution
 * graph: a column per week (Monday at the top), the last column holding
 * today. Each day is shaded by how much was played: answers given in every
 * run that day (play-log.ts), so a busy day glows brighter.
 */
import { addDays, weekStartOf } from './days.ts';
import type { PlayedRun } from './play-log.ts';

/** Weeks the calendar shows: about four months, enough to see a habit form. */
export const CALENDAR_WEEKS = 18;
const DAYS_PER_WEEK = 7;

/**
 * The fewest answers in a day for each shade, brightest last. One run is
 * about 10 to 30 answers, so the brightest shade means several runs.
 */
export const SHADE_THRESHOLDS = [1, 10, 30, 60] as const;

export interface CalendarDay {
  day: string;
  answers: number;
  /** 0 for no play, up to SHADE_THRESHOLDS.length for the busiest days. */
  shade: number;
  isFuture: boolean;
}

/** Days with any answer in a run. */
export function playedDays(runs: readonly PlayedRun[]): Set<string> {
  return new Set(runs.filter((run) => run.answered > 0).map((run) => run.day));
}

export function answersByDay(runs: readonly PlayedRun[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const run of runs) totals.set(run.day, (totals.get(run.day) ?? 0) + run.answered);
  return totals;
}

export function shadeFor(answers: number): number {
  return SHADE_THRESHOLDS.filter((threshold) => answers >= threshold).length;
}

/** The calendar's weeks, oldest first, each Monday to Sunday; the last holds today. */
export function calendarWeeks(
  runs: readonly PlayedRun[],
  today: string,
  weekCount: number = CALENDAR_WEEKS,
): CalendarDay[][] {
  const totals = answersByDay(runs);
  const firstMonday = addDays(weekStartOf(today), -DAYS_PER_WEEK * (weekCount - 1));
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, weekday) => {
      const day = addDays(firstMonday, week * DAYS_PER_WEEK + weekday);
      const answers = totals.get(day) ?? 0;
      return { day, answers, shade: shadeFor(answers), isFuture: day > today };
    }),
  );
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

/** A day as the calendar names it: Today, Yesterday, or the date (Mon 24 Nov). */
export function dayLabel(day: string, today: string): string {
  if (day === today) return 'Today';
  if (day === addDays(today, -1)) return 'Yesterday';
  return DAY_FORMAT.format(new Date(`${day}T00:00:00Z`));
}
