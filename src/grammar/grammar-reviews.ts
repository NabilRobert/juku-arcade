/**
 * Grammar reviews (D57): each grammar point has its own spaced reviews,
 * scheduled exactly like words (leitner.ts, through word-memory.ts:
 * recordAnswer), and rebuilt from the grammar log on load.
 *
 * - A right sentence is a right answer for its point; a wrong order is a
 *   wrong one. A timeout isn't an answer: like word mode's (D4), it
 *   measures speed more than memory.
 * - Today's grammar is the points due today, then up to NEW_POINTS_PER_DAY
 *   new ones, in curriculum order.
 * - A tale needs a different point on every line and every part of the
 *   tale covered, so more points than today's grammar: pointsByPriority
 *   ranks today's grammar first, then the weakest points seen so far, then
 *   new ones, and the tale takes as many from the top as it needs
 *   (tale.ts: makeTaleFromRanking). On a first day that makes a starter
 *   set of new points.
 */
import { recordAnswer, type WordMemory } from '../memory/word-memory.ts';
import type { DailyProgress } from '../memory/daily-deck.ts';
import type { GrammarEvent } from './grammar-events.ts';

/** New points a day: fewer than words' 10, since each point is a bigger idea. */
export const NEW_POINTS_PER_DAY = 3;

export type PointMemory = WordMemory;

export interface GrammarProgress {
  daily: DailyProgress;
  pointsSeen: number;
  pointsKnown: number;
  pointCount: number;
}

export interface GrammarReviews {
  record: (event: GrammarEvent) => void;
  /** Every point, ranked for the next tale: today's grammar first. */
  pointsByPriority: (today: string) => string[];
  progress: (today: string) => GrammarProgress;
  /** A point's review box now, for the next event's box_before; null if new. */
  boxOf: (pointId: string) => number | null;
}

function answerOf(event: GrammarEvent): boolean | null {
  if (event.outcome === 'right') return true;
  if (event.outcome === 'wrong') return false;
  return null;
}

function applyGrammarEvent(memory: Map<string, PointMemory>, event: GrammarEvent): void {
  const isCorrect = answerOf(event);
  if (isCorrect === null) return;
  memory.set(event.point_id, recordAnswer(memory.get(event.point_id), isCorrect, event.at));
}

const isDue = (record: PointMemory, today: string): boolean =>
  record.dueDay !== null && record.dueDay <= today && record.lastAnswerDay !== today;

/** The days' tallies behind today's grammar and its progress. */
function dayCounts(points: readonly string[], memory: Map<string, PointMemory>, today: string) {
  const records = points.flatMap((point) => {
    const record = memory.get(point);
    return record === undefined ? [] : [{ point, record }];
  });
  const newToday = records.filter(({ record }) => record.firstSeenDay === today).length;
  return {
    due: records.filter(({ record }) => isDue(record, today)).map(({ point }) => point),
    reviewedToday: records.filter(({ record }) => record.lastDueReviewDay === today).length,
    newToday: Math.min(newToday, NEW_POINTS_PER_DAY),
    unseen: points.filter((point) => !memory.has(point)),
  };
}

function dailyProgress(
  points: readonly string[],
  memory: Map<string, PointMemory>,
  today: string,
): DailyProgress {
  const counts = dayCounts(points, memory, today);
  const newLeft = Math.min(NEW_POINTS_PER_DAY - counts.newToday, counts.unseen.length);
  const done = counts.reviewedToday + counts.newToday;
  const total = done + counts.due.length + newLeft;
  return { done, total, isCleared: total > 0 && done === total };
}

/** Seen points, weakest first: lowest box, then the most misses per attempt. */
function weakestSeen(points: readonly string[], memory: Map<string, PointMemory>): string[] {
  const weakness = (point: string): number => {
    const record = memory.get(point);
    if (record === undefined) return Number.POSITIVE_INFINITY;
    return (record.box ?? 0) - record.misses / Math.max(record.attempts, 1);
  };
  return points.filter((point) => memory.has(point)).sort((a, b) => weakness(a) - weakness(b));
}

function pointsByPriority(
  points: readonly string[],
  memory: Map<string, PointMemory>,
  today: string,
): string[] {
  const counts = dayCounts(points, memory, today);
  const newLeft = Math.max(0, NEW_POINTS_PER_DAY - counts.newToday);
  const todays = [...counts.due, ...counts.unseen.slice(0, newLeft)];
  return [...new Set([...todays, ...weakestSeen(points, memory), ...counts.unseen])];
}

/** Grammar reviews over `points` (in curriculum order), rebuilt from the grammar log. */
export function createGrammarReviews(
  points: readonly string[],
  pastEvents: readonly GrammarEvent[],
): GrammarReviews {
  const memory = new Map<string, PointMemory>();
  for (const event of pastEvents) applyGrammarEvent(memory, event);
  return {
    record: (event) => applyGrammarEvent(memory, event),
    pointsByPriority: (today) => pointsByPriority(points, memory, today),
    progress: (today) => ({
      daily: dailyProgress(points, memory, today),
      pointsSeen: points.filter((point) => memory.has(point)).length,
      pointsKnown: points.filter((point) => memory.get(point)?.isKnown === true).length,
      pointCount: points.length,
    }),
    boxOf: (pointId) => memory.get(pointId)?.box ?? null,
  };
}
