import { describe, expect, it } from 'vitest';
import { levelAfterMatch, levelAfterMiss, setDurationMs } from '../src/game/levels.ts';
import { scoreSet } from '../src/game/score.ts';
import { tagsByRank } from '../src/game/tags.ts';
import { deckWord } from './helpers/fixtures.ts';

describe('levels', () => {
  it('goes up a level when the combo reaches 10, 20, 30 and 40', () => {
    expect(levelAfterMatch(1, 10)).toBe(2);
    expect(levelAfterMatch(4, 40)).toBe(5);
  });

  it('stays at the same level between milestones', () => {
    expect(levelAfterMatch(2, 13)).toBe(2);
  });

  it('never goes above level 5', () => {
    expect(levelAfterMatch(5, 50)).toBe(5);
  });

  it('drops one level on a miss', () => {
    expect(levelAfterMiss(4)).toBe(3);
  });

  it('drops from level 5 to level 1 on a miss', () => {
    expect(levelAfterMiss(5)).toBe(1);
  });

  it('never drops below level 1', () => {
    expect(levelAfterMiss(1)).toBe(1);
  });

  it('gives 40 seconds at level 1 and 12 seconds at level 5', () => {
    expect(setDurationMs(1)).toBe(40_000);
    expect(setDurationMs(5)).toBe(12_000);
  });
});

describe('set score', () => {
  it('matches the worked example in requirement L7', () => {
    expect(scoreSet([0.1, 0.2, 0.1, 0.5, 0.3], 8.7, 3)).toEqual({
      chips: 58,
      multiplier: 6.6,
      total: 383,
    });
  });

  it('counts only whole seconds left', () => {
    expect(scoreSet([], 4.99, 1).chips).toBe(4);
  });

  it('scores a set with no clean matches at chips × level', () => {
    expect(scoreSet([], 10, 2)).toEqual({ chips: 10, multiplier: 2, total: 20 });
  });
});

describe('difficulty tags', () => {
  it('tags the easiest fifth +0.1 and the hardest fifth +0.5', () => {
    const words = Array.from({ length: 10 }, (_, index) => ({
      ...deckWord(String(index), `語${index}`, `ご${index}`),
      missChanceGuess: index / 10,
    }));
    const tags = tagsByRank(words);
    expect(tags.get('0')).toBe(0.1);
    expect(tags.get('9')).toBe(0.5);
  });
});
