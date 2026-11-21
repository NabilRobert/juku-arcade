import { describe, expect, it } from 'vitest';
import { decoysFor, missChanceGuess, toDeckWord } from '../scripts/deck-words.ts';
import type { VocabRow } from '../scripts/openjlpt.ts';
import { KANJI_TABLE } from './helpers/fixtures.ts';

function row(word: string, reading: string, otherReadings: string[] = []): VocabRow {
  return {
    id: `id-${word}`,
    word,
    reading,
    otherReadings,
    level: 'N5',
    meanings: ['school', 'a', 'b', 'c'],
    examples: [
      { ja: '学校へ行く。', en: 'I go to school.', tatoeba_id: 1 },
      { ja: '学校だ。', furigana: '{学校|がっこう}だ。', en: "It's a school.", tatoeba_id: 2 },
    ],
  };
}

describe('deck words', () => {
  it('leaves out kana-only words', () => {
    expect(toDeckWord(row('これ', 'これ'), KANJI_TABLE)).toBeNull();
  });

  it('keeps words with kanji', () => {
    expect(toDeckWord(row('学校', 'がっこう'), KANJI_TABLE)?.reading).toBe('がっこう');
  });

  it('guesses an irregular reading is harder', () => {
    const regular = missChanceGuess(row('今日', 'きょう'), KANJI_TABLE, false);
    expect(missChanceGuess(row('今日', 'きょう'), KANJI_TABLE, true)).toBeGreaterThan(regular);
  });

  it('guesses a higher level is harder', () => {
    const n5 = missChanceGuess(row('学校', 'がっこう'), KANJI_TABLE, false);
    const n1 = missChanceGuess({ ...row('学校', 'がっこう'), level: 'N1' }, KANJI_TABLE, false);
    expect(n1).toBeGreaterThan(n5);
  });

  it('never uses a valid reading as a decoy', () => {
    const decoys = Object.values(decoysFor(row('今日', 'きょう', ['こんにち']), KANJI_TABLE));
    expect(decoys).not.toContain('きょう');
    expect(decoys).not.toContain('こんにち');
  });

  it('keeps at most 3 meanings for the card back', () => {
    expect(toDeckWord(row('学校', 'がっこう'), KANJI_TABLE)?.meanings).toEqual([
      'school',
      'a',
      'b',
    ]);
  });

  it('prefers an example with furigana', () => {
    expect(toDeckWord(row('学校', 'がっこう'), KANJI_TABLE)?.example).toEqual({
      text: '{学校|がっこう}だ。',
      english: "It's a school.",
      tatoebaId: 2,
    });
  });

  it('gives 学校 a decoy of every type it can', () => {
    expect(decoysFor(row('学校', 'がっこう'), KANJI_TABLE)).toEqual({
      longVowel: 'がっこ',
      smallTsu: 'がこう',
      dakuten: 'かっこう',
      otherReading: 'がくこう',
    });
  });
});
