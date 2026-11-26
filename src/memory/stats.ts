/**
 * The player's own stats, for the stats page: worked out from the event
 * log in this browser, the same log the reviews read. Nothing here is sent
 * anywhere. Kanji mode logs nothing, so these are word mode's numbers.
 */
import type { DeckWord, DecoyType } from '../deck/types.ts';
import { wordAnswerScore, type ErrorType, type GameEvent } from '../game/events.ts';

/** How many most-missed words the page lists. */
export const MOST_MISSED_SHOWN = 5;

/** Each kind of mistake, as the page names it. */
export const MISTAKE_NAMES: Record<ErrorType, string> = {
  longVowel: 'Long vowels (おう or おお?)',
  smallTsu: 'Small っ',
  dakuten: 'Dakuten (か or が?)',
  smallYoon: 'Small ゃゅょ',
  otherReading: "Another of the kanji's readings",
  mixUp: 'Mixing up two words',
} satisfies Record<DecoyType | 'mixUp', string>;

export interface AnswerCounts {
  right: number;
  wrong: number;
  timedOut: number;
}

export interface MissedWord {
  word: string;
  reading: string;
  misses: number;
}

export interface PlayerStats {
  allTime: AnswerCounts;
  today: AnswerCounts;
  setsPlayed: number;
  daysPlayed: number;
  mostMissed: MissedWord[];
  mistakes: { name: string; count: number }[];
}

const isDay = (event: GameEvent, day: string): boolean => event.at.startsWith(day);

/** Right answers, misses and timeouts; a peeked match counts as neither right nor wrong. */
export function countAnswers(events: readonly GameEvent[]): AnswerCounts {
  const counts: AnswerCounts = { right: 0, wrong: 0, timedOut: 0 };
  for (const event of events) {
    const score = wordAnswerScore(event);
    if (score === 'right') counts.right += 1;
    if (score === 'wrong') counts.wrong += 1;
    if (event.kind === 'timeout') counts.timedOut += 1;
  }
  return counts;
}

/** The share of answers that were right, 0 to 1, or null before any answer. */
export function accuracy({ right, wrong, timedOut }: AnswerCounts): number | null {
  const answered = right + wrong + timedOut;
  return answered === 0 ? null : right / answered;
}

/** The share right as the stats page shows it: "84%", or "–" before any answer. */
export function percentRight(counts: AnswerCounts): string {
  const share = accuracy(counts);
  return share === null ? '–' : `${Math.round(share * 100)}%`;
}

function mostMissed(misses: readonly GameEvent[], words: readonly DeckWord[]): MissedWord[] {
  const byWord = new Map<string, number>();
  for (const miss of misses) {
    if (miss.word_id !== null) byWord.set(miss.word_id, (byWord.get(miss.word_id) ?? 0) + 1);
  }
  return [...byWord]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MOST_MISSED_SHOWN)
    .flatMap(([wordId, count]) => {
      const word = words.find((candidate) => candidate.id === wordId);
      return word === undefined ? [] : [{ word: word.word, reading: word.reading, misses: count }];
    });
}

function mistakeKinds(misses: readonly GameEvent[]): { name: string; count: number }[] {
  const byKind = new Map<ErrorType, number>();
  for (const miss of misses) {
    if (miss.error_type !== null)
      byKind.set(miss.error_type, (byKind.get(miss.error_type) ?? 0) + 1);
  }
  return [...byKind]
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => ({ name: MISTAKE_NAMES[kind], count }));
}

export function playerStats(
  events: readonly GameEvent[],
  words: readonly DeckWord[],
  today: string,
): PlayerStats {
  const misses = events.filter((event) => event.kind === 'miss');
  return {
    allTime: countAnswers(events),
    today: countAnswers(events.filter((event) => isDay(event, today))),
    setsPlayed: events.filter((event) => event.kind === 'deal').length,
    daysPlayed: new Set(events.map((event) => event.at.slice(0, 10))).size,
    mostMissed: mostMissed(misses, words),
    mistakes: mistakeKinds(misses),
  };
}
