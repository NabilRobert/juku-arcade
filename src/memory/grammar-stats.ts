/**
 * The player's grammar stats, for the stats page: worked out from the
 * grammar log in this browser (D57), as the word stats are from the word
 * log (stats.ts). Right sentences today and overall, the grammar points
 * missed most, and the kinds of mistake (the rule a wrong order broke).
 * Nothing here is sent anywhere.
 */
import type { BrokenRule } from '../grammar/broken-rule.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import type { AnswerCounts } from './stats.ts';
import { localDayOf } from './word-memory.ts';

/** How many most-missed grammar points the page lists. */
export const MOST_MISSED_POINTS_SHOWN = 5;

/** Each broken rule as the page names it. */
export const BROKEN_RULE_NAMES: Readonly<Record<BrokenRule, string>> = {
  verb_not_last: 'The verb not at the end',
  particle_after_wrong_word: 'A particle after the wrong word',
  pieces_out_of_order: "A pattern's pieces out of order",
};

export interface GrammarStats {
  allTime: AnswerCounts;
  today: AnswerCounts;
  /** Point ids, most missed first, with their misses (wrong or timed out). */
  mostMissed: { pointId: string; misses: number }[];
  mistakes: { name: string; count: number }[];
}

function countOutcomes(events: readonly GrammarEvent[]): AnswerCounts {
  const counts: AnswerCounts = { right: 0, wrong: 0, timedOut: 0 };
  for (const event of events) {
    if (event.outcome === 'right') counts.right += 1;
    if (event.outcome === 'wrong') counts.wrong += 1;
    if (event.outcome === 'timeout') counts.timedOut += 1;
  }
  return counts;
}

function tally<T>(items: readonly T[]): [T, number][] {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}

export function grammarStats(events: readonly GrammarEvent[], today: string): GrammarStats {
  const missed = events.filter((event) => event.outcome !== 'right');
  const broken = events.flatMap((event) => (event.broken_rule === null ? [] : [event.broken_rule]));
  return {
    allTime: countOutcomes(events),
    today: countOutcomes(events.filter((event) => localDayOf(event.at) === today)),
    mostMissed: tally(missed.map((event) => event.point_id))
      .slice(0, MOST_MISSED_POINTS_SHOWN)
      .map(([pointId, misses]) => ({ pointId, misses })),
    mistakes: tally(broken).map(([rule, count]) => ({ name: BROKEN_RULE_NAMES[rule], count })),
  };
}
