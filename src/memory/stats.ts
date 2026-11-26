/**
 * The player's own stats, for the stats page: worked out from the event
 * log in this browser, the same log the reviews read. Nothing here is sent
 * anywhere. Kanji mode's rounds aren't review events, so these are word mode's numbers.
 */
import { tally } from './tally.ts';
import { localDayOf } from './days.ts';
import type { DeckWord, DecoyType } from '../deck/types.ts';
import { wordAnswerScore, type ErrorType, type GameEvent } from '../game/events.ts';
import { translate } from '../i18n/index.ts';

/** How many most-missed words the page lists. */
export const MOST_MISSED_SHOWN = 5;

/** A kind of mistake as the page names it, in the interface language, so call it while the page computes. */
export function mistakeName(kind: ErrorType): string {
  const names: Record<ErrorType, string> = {
    longVowel: translate('pages.stats.mistakes.longVowel'),
    smallTsu: translate('pages.stats.mistakes.smallTsu'),
    dakuten: translate('pages.stats.mistakes.dakuten'),
    smallYoon: translate('pages.stats.mistakes.smallYoon'),
    otherReading: translate('pages.stats.mistakes.otherReading'),
    mixUp: translate('pages.stats.mistakes.mixUp'),
  } satisfies Record<DecoyType | 'mixUp', string>;
  return names[kind];
}

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
  const wordIds = misses.flatMap((miss) => (miss.word_id === null ? [] : [miss.word_id]));
  return tally(wordIds)
    .slice(0, MOST_MISSED_SHOWN)
    .flatMap(([wordId, count]) => {
      const word = words.find((candidate) => candidate.id === wordId);
      return word === undefined ? [] : [{ word: word.word, reading: word.reading, misses: count }];
    });
}

function mistakeKinds(misses: readonly GameEvent[]): { name: string; count: number }[] {
  const kinds = misses.flatMap((miss) => (miss.error_type === null ? [] : [miss.error_type]));
  return tally(kinds).map(([kind, count]) => ({ name: mistakeName(kind), count }));
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
    daysPlayed: new Set(events.map((event) => localDayOf(event.at))).size,
    mostMissed: mostMissed(misses, words),
    mistakes: mistakeKinds(misses),
  };
}
