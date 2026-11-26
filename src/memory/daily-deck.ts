/**
 * Which words come up: today's deck first (the reviews due plus 10 new
 * words, L10), then endless play (weak words plus a trickle of new ones,
 * L11). Both work on one JLPT level's deck.
 */
import type { DeckWord } from '../deck/types.ts';
import type { RandomSource } from '../game/deal.ts';
import {
  ENDLESS_NEW_WORDS,
  ENDLESS_WEAK_WORDS,
  MIN_POOL_SIZE,
  NEW_WORDS_PER_DAY,
} from '../game/tuning.ts';
import { isOnHold } from './check-up.ts';
import { learnedMissChance } from './difficulty.ts';
import type { Memory } from './word-memory.ts';

export interface DailyProgress {
  done: number;
  total: number;
  isCleared: boolean;
}

function remainingDue(words: readonly DeckWord[], memory: Memory, today: string): DeckWord[] {
  return words.filter((word) => {
    const record = memory.words.get(word.id);
    return record?.dueDay != null && record.dueDay <= today && record.lastAnswerDay !== today;
  });
}

/** Words never answered, minus any held back by the check-up (C2), easiest guess first, so a new player starts gently. */
function unseen(words: readonly DeckWord[], memory: Memory, today: string): DeckWord[] {
  return words
    .filter((word) => !memory.words.has(word.id) && !isOnHold(memory.checkUps, word.id, today))
    .sort((a, b) => a.missChanceGuess - b.missChanceGuess || a.id.localeCompare(b.id));
}

function countWhere(
  words: readonly DeckWord[],
  memory: Memory,
  test: (day: string | null, first: string) => boolean,
): number {
  return words.filter((word) => {
    const record = memory.words.get(word.id);
    return record !== undefined && test(record.lastDueReviewDay, record.firstSeenDay);
  }).length;
}

export function dailyProgress(
  words: readonly DeckWord[],
  memory: Memory,
  today: string,
): DailyProgress {
  const reviewedToday = countWhere(words, memory, (dueReviewDay) => dueReviewDay === today);
  const newToday = Math.min(
    countWhere(words, memory, (_, first) => first === today),
    NEW_WORDS_PER_DAY,
  );
  const newLeft = Math.min(NEW_WORDS_PER_DAY - newToday, unseen(words, memory, today).length);
  const done = reviewedToday + newToday;
  const total = done + remainingDue(words, memory, today).length + newLeft;
  return { done, total, isCleared: total > 0 && done === total };
}

/** A weighted sample without replacement: weaker words are likelier (Efraimidis–Spirakis keys). */
function weakSample(
  words: readonly DeckWord[],
  memory: Memory,
  count: number,
  random: RandomSource,
): DeckWord[] {
  const keyed = words.map((word) => ({
    word,
    key: random() ** (1 / learnedMissChance(word, memory)),
  }));
  return keyed
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((entry) => entry.word);
}

function toppedUp(
  pool: DeckWord[],
  words: readonly DeckWord[],
  memory: Memory,
  today: string,
  random: RandomSource,
): DeckWord[] {
  if (pool.length >= MIN_POOL_SIZE) return pool;
  const ids = new Set(pool.map((word) => word.id));
  const seen = words.filter((word) => memory.words.has(word.id) && !ids.has(word.id));
  const extra = [
    ...weakSample(seen, memory, MIN_POOL_SIZE, random),
    ...unseen(words, memory, today),
  ].filter((word) => !ids.has(word.id));
  return [...pool, ...extra].slice(0, Math.max(MIN_POOL_SIZE, pool.length));
}

export function poolForNextSet(
  words: readonly DeckWord[],
  memory: Memory,
  today: string,
  random: RandomSource,
): DeckWord[] {
  const progress = dailyProgress(words, memory, today);
  if (!progress.isCleared) {
    const newToday = countWhere(words, memory, (_, first) => first === today);
    const newLeft = Math.max(0, NEW_WORDS_PER_DAY - newToday);
    const daily = [
      ...remainingDue(words, memory, today),
      ...unseen(words, memory, today).slice(0, newLeft),
    ];
    return toppedUp(daily, words, memory, today, random);
  }
  const seen = words.filter((word) => memory.words.has(word.id));
  const endless = [
    ...weakSample(seen, memory, ENDLESS_WEAK_WORDS, random),
    ...unseen(words, memory, today).slice(0, ENDLESS_NEW_WORDS),
  ];
  return toppedUp(endless, words, memory, today, random);
}
