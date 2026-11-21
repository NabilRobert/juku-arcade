import { describe, expect, it } from 'vitest';
import { dailyProgress, poolForNextSet } from '../src/memory/daily-deck.ts';
import { learnedMissChance } from '../src/memory/difficulty.ts';
import { addDays, afterAnswer, NEW_WORD } from '../src/memory/leitner.ts';
import { createLocalEngine } from '../src/memory/review-engine.ts';
import { applyEvent, deriveMemory, emptyMemory } from '../src/memory/word-memory.ts';
import { answer } from './helpers/events.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

const DAY = '2026-11-21';
const FIRST_WORD = deckWord('w0', '語0', 'ご0');
const WORDS = Array.from({ length: 30 }, (_, index) => ({
  ...deckWord(`w${index}`, `語${index}`, `ご${index}`),
  missChanceGuess: 0.1 + index / 100,
}));
const FIRST = { ...FIRST_WORD, missChanceGuess: 0.1 };

describe('Leitner boxes', () => {
  it('puts a wrong answer in box 1, due tomorrow', () => {
    expect(afterAnswer(NEW_WORD, false, DAY)).toMatchObject({ box: 1, dueDay: '2026-11-22' });
  });

  it('moves a right answer up one box and doubles the wait', () => {
    const boxTwo = afterAnswer(afterAnswer(NEW_WORD, true, DAY), true, addDays(DAY, 1));
    expect(boxTwo).toMatchObject({ box: 2, dueDay: '2026-11-24' });
  });

  it('moves a word up at most once a day', () => {
    const twiceToday = afterAnswer(afterAnswer(NEW_WORD, true, DAY), true, DAY);
    expect(twiceToday.box).toBe(1);
  });

  it('counts a word known after right answers on 2 separate days', () => {
    const sameDay = afterAnswer(afterAnswer(NEW_WORD, true, DAY), true, DAY);
    expect(sameDay.isKnown).toBe(false);
    expect(afterAnswer(sameDay, true, addDays(DAY, 1)).isKnown).toBe(true);
  });
});

describe('word memory from events', () => {
  it('treats misses and peeks as wrong, clean matches as right, and ignores timeouts', () => {
    const memory = deriveMemory([
      answer('w1', DAY, 'miss'),
      answer('w2', DAY, 'peek'),
      answer('w3', DAY, 'clean'),
      answer('w4', DAY, 'timeout'),
    ]);
    expect(memory.words.get('w1')?.misses).toBe(1);
    expect(memory.words.get('w2')?.misses).toBe(1);
    expect(memory.words.get('w3')?.misses).toBe(0);
    expect(memory.words.has('w4')).toBe(false);
  });

  it('gives the same memory whether built event by event or from the whole log', () => {
    const log = [
      answer('w1', DAY, 'clean'),
      answer('w1', addDays(DAY, 1), 'miss'),
      answer('w2', addDays(DAY, 2), 'clean'),
    ];
    const incremental = emptyMemory();
    for (const event of log) applyEvent(incremental, event);
    expect(incremental).toEqual(deriveMemory(log));
  });
});

describe('the daily deck', () => {
  it('starts a new player with 10 new words', () => {
    expect(dailyProgress(WORDS, emptyMemory(), DAY)).toEqual({
      done: 0,
      total: 10,
      isCleared: false,
    });
  });

  it('adds the reviews due to the new words, and clears when all are done', () => {
    const yesterday = addDays(DAY, -1);
    const memory = deriveMemory(
      WORDS.slice(0, 10).map((word) => answer(word.id, yesterday, 'clean')),
    );
    expect(dailyProgress(WORDS, memory, DAY).total).toBe(20);
    for (const word of WORDS.slice(0, 20)) applyEvent(memory, answer(word.id, DAY, 'clean'));
    expect(dailyProgress(WORDS, memory, DAY)).toEqual({ done: 20, total: 20, isCleared: true });
  });

  it("deals from today's words until the deck is cleared", () => {
    const pool = poolForNextSet(WORDS, emptyMemory(), DAY, seededRandom(1));
    expect(pool.map((word) => word.id)).toEqual(WORDS.slice(0, 10).map((word) => word.id));
  });

  it('mixes weak words with one new word after the deck is cleared', () => {
    const memory = deriveMemory(WORDS.slice(0, 10).map((word) => answer(word.id, DAY, 'clean')));
    const pool = poolForNextSet(WORDS, memory, DAY, seededRandom(1));
    const unseenInPool = pool.filter((word) => !memory.words.has(word.id));
    expect(unseenInPool.map((word) => word.id)).toEqual(['w10']);
    expect(pool.length).toBeGreaterThanOrEqual(8);
  });
});

describe('learned difficulty', () => {
  it("starts from the deck's guess", () => {
    expect(learnedMissChance(FIRST, emptyMemory())).toBe(0.1);
  });

  it('rises with misses', () => {
    const memory = deriveMemory([answer('w0', DAY, 'miss'), answer('w0', DAY, 'miss')]);
    expect(learnedMissChance(FIRST, memory)).toBeCloseTo((2 + 5 * 0.1) / (2 + 5));
  });
});

describe('the review engine', () => {
  it('counts known words and days played', () => {
    const log = [answer('w0', DAY, 'clean'), answer('w0', addDays(DAY, 1), 'clean')];
    const progress = createLocalEngine(WORDS, log).getProgress(addDays(DAY, 1));
    expect([progress.wordsKnown, progress.daysPlayedThisWeek]).toEqual([1, 2]);
  });

  it("reports a word's history for its events", () => {
    const engine = createLocalEngine(WORDS, [answer('w0', DAY, 'miss')]);
    expect(engine.history('w0', addDays(DAY, 3))).toEqual({
      timesSeenBefore: 1,
      daysSinceLastSeen: 3,
      boxBefore: 1,
    });
  });
});
