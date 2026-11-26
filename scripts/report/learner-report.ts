/**
 * An ability report per learner, by anonymous ID (A2): words known (the
 * app's own rule, from the same deriveMemory), weak words and their usual
 * wrong reading, error types, recall speed by week, and how well words are
 * held after about 1, 4 and 8 days.
 */
import { tally } from '../../src/memory/tally.ts';
import type { GameEvent } from '../../src/game/events.ts';
import { MS_PER_DAY } from '../../src/memory/days.ts';
import { deriveMemory } from '../../src/memory/word-memory.ts';
import { isRight, isWrong, pickedReading, wordSpellings } from './answers.ts';

const WEAK_WORDS_SHOWN = 5;
const MS_PER_WEEK = 7 * MS_PER_DAY;
/** Retention buckets: days since the word was last seen, as [label, from, to]. */
const RETENTION_BUCKETS: readonly [string, number, number][] = [
  ['1 day', 1, 1],
  ['about 4 days', 2, 5],
  ['about 8 days', 6, 12],
];

export interface LearnerReport {
  playerId: string;
  wordsSeen: number;
  wordsKnown: number;
  weakWords: { word: string; misses: number; usualPick: string | null }[];
  errorTypes: Record<string, number>;
  /** Median ms per clean match, oldest week first; null for weeks without play. */
  speedByWeek: (number | null)[];
  retention: { label: string; answers: number; accuracy: number | null }[];
}

function mostCommon(values: readonly string[]): string | null {
  return tally(values)[0]?.[0] ?? null;
}

function weakWords(events: readonly GameEvent[]): LearnerReport['weakWords'] {
  const memory = deriveMemory(events);
  const spellings = wordSpellings(events);
  return [...memory.words.entries()]
    .filter(([, record]) => record.misses > 0)
    .sort((a, b) => b[1].misses - a[1].misses)
    .slice(0, WEAK_WORDS_SHOWN)
    .map(([wordId, record]) => {
      const picks = events.filter((event) => event.word_id === wordId).map(pickedReading);
      return {
        word: spellings.get(wordId) ?? wordId,
        misses: record.misses,
        usualPick: mostCommon(picks.filter((pick) => pick !== null)),
      };
    });
}

function speedByWeek(events: readonly GameEvent[], now: Date): (number | null)[] {
  const weeks: number[][] = [[], [], [], []];
  for (const event of events) {
    if (!isRight(event) || event.ms_since_last_action === null) continue;
    const weeksAgo = Math.floor((now.getTime() - Date.parse(event.at)) / MS_PER_WEEK);
    weeks[weeks.length - 1 - weeksAgo]?.push(event.ms_since_last_action);
  }
  return weeks.map((times) =>
    times.length === 0
      ? null
      : ([...times].sort((a, b) => a - b)[Math.floor(times.length / 2)] ?? null),
  );
}

function retention(events: readonly GameEvent[]): LearnerReport['retention'] {
  return RETENTION_BUCKETS.map(([label, from, to]) => {
    const answers = events.filter((event) => {
      const days = event.days_since_last_seen;
      return (isRight(event) || isWrong(event)) && days !== null && days >= from && days <= to;
    });
    const right = answers.filter(isRight).length;
    return {
      label,
      answers: answers.length,
      accuracy: answers.length === 0 ? null : right / answers.length,
    };
  });
}

export function learnerReport(
  playerId: string,
  events: readonly GameEvent[],
  now: Date,
): LearnerReport {
  const memory = deriveMemory(events);
  const errorTypes: Record<string, number> = {};
  for (const event of events) {
    if (event.kind === 'miss' && event.error_type)
      errorTypes[event.error_type] = (errorTypes[event.error_type] ?? 0) + 1;
  }
  return {
    playerId,
    wordsSeen: memory.words.size,
    wordsKnown: [...memory.words.values()].filter((record) => record.isKnown).length,
    weakWords: weakWords(events),
    errorTypes,
    speedByWeek: speedByWeek(events, now),
    retention: retention(events),
  };
}
