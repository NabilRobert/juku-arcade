import { describe, expect, it } from 'vitest';
import {
  candidateReadings,
  isIrregularReading,
  otherReadingDecoy,
  readingOptions,
} from '../src/deck/readings.ts';
import { KANJI_TABLE } from './helpers/fixtures.ts';

describe('readings', () => {
  it('gives on-yomi in hiragana and kun-yomi with their stem form', () => {
    expect(readingOptions({ onyomi: ['ニュウ'], kunyomi: ['い.る'] })).toEqual([
      'にゅう',
      'い',
      'いり',
    ]);
  });

  it('combines kanji readings with sokuon: 学校 can be がっこう', () => {
    expect(candidateReadings('学校', KANJI_TABLE)).toContain('がっこう');
  });

  it('combines kanji readings with rendaku: 入口 can be いりぐち', () => {
    expect(candidateReadings('入口', KANJI_TABLE)).toContain('いりぐち');
  });

  it('does not double a verb ending the word already spells: 入る is never いりる', () => {
    expect(candidateReadings('入る', KANJI_TABLE)).not.toContain('いりる');
    expect(candidateReadings('入る', KANJI_TABLE)).toContain('いる');
  });

  it('returns null when a kanji is missing from the table', () => {
    expect(candidateReadings('学生', KANJI_TABLE)).toBeNull();
  });

  it('flags 今日 きょう as irregular', () => {
    expect(isIrregularReading('今日', 'きょう', KANJI_TABLE)).toBe(true);
  });

  it('does not flag 学校 がっこう or 入口 いりぐち as irregular', () => {
    expect(isIrregularReading('学校', 'がっこう', KANJI_TABLE)).toBe(false);
    expect(isIrregularReading('入口', 'いりぐち', KANJI_TABLE)).toBe(false);
  });

  it('reads 々 as a repeat of the kanji before it', () => {
    expect(candidateReadings('人々', KANJI_TABLE)).toContain('ひとびと');
  });

  it('picks the closest wrong combination as the other-reading decoy', () => {
    expect(otherReadingDecoy('学校', ['がっこう'], KANJI_TABLE)).toBe('がくこう');
  });

  it('never picks a valid reading or one far longer than the real reading', () => {
    const decoy = otherReadingDecoy('今日', ['きょう', 'こんにち'], KANJI_TABLE) ?? '';
    expect(['きょう', 'こんにち']).not.toContain(decoy);
    expect(Math.abs(decoy.length - 'きょう'.length)).toBeLessThanOrEqual(1);
  });
});
