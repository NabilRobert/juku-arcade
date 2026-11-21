import { describe, expect, it } from 'vitest';
import { dealSet, WORDS_PER_SET } from '../src/game/deal.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

const POOL = [
  deckWord('1', '学校', 'がっこう'),
  deckWord('2', '先生', 'せんせい'),
  deckWord('3', '電車', 'でんしゃ'),
  deckWord('4', '時間', 'じかん'),
  deckWord('5', '友達', 'ともだち'),
  deckWord('6', '橋', 'はし'),
  deckWord('7', '箸', 'はし'),
  deckWord('8', '今日', 'きょう', ['こんにち']),
  deckWord('9', '今日は', 'こんにち'),
];

describe('deal', () => {
  it('deals 5 words and 6 readings, one of them a decoy', () => {
    const set = dealSet(POOL, seededRandom(1));
    expect(set.words).toHaveLength(WORDS_PER_SET);
    expect(set.readings).toHaveLength(WORDS_PER_SET + 1);
    expect(set.readings.filter((card) => card.wordId === null)).toHaveLength(1);
  });

  it('never deals two words that share a valid reading', () => {
    for (let seed = 0; seed < 200; seed++) {
      const readings = dealSet(POOL, seededRandom(seed)).words.flatMap((word) => [
        word.reading,
        ...word.otherReadings,
      ]);
      expect(new Set(readings).size).toBe(readings.length);
    }
  });

  it('never deals a decoy that is a valid reading of a word in the set', () => {
    for (let seed = 0; seed < 200; seed++) {
      const set = dealSet(POOL, seededRandom(seed));
      const valid = set.words.flatMap((word) => [word.reading, ...word.otherReadings]);
      const decoy = set.readings.find((card) => card.wordId === null);
      expect(valid).not.toContain(decoy?.text);
    }
  });

  it('deals the same set for the same seed', () => {
    expect(dealSet(POOL, seededRandom(7))).toEqual(dealSet(POOL, seededRandom(7)));
  });

  it('explains when the deck is too small to deal', () => {
    expect(() => dealSet(POOL.slice(0, 4), seededRandom(1))).toThrow(/fewer than 5 words/);
  });
});
