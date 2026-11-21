import { describe, expect, it } from 'vitest';
import { parseFurigana } from '../src/deck/furigana.ts';
import { readingsUsedIn } from '../src/deck/readings.ts';
import { KANJI_TABLE } from './helpers/fixtures.ts';

describe('furigana', () => {
  it('splits marked text into plain pieces and pieces with readings', () => {
    expect(parseFurigana('この{学校|がっこう}は')).toEqual([
      { text: 'この' },
      { text: '学校', reading: 'がっこう' },
      { text: 'は' },
    ]);
  });

  it('keeps unmarked text as one piece', () => {
    expect(parseFurigana('学校へ行く。')).toEqual([{ text: '学校へ行く。' }]);
  });
});

describe('readings used in a word', () => {
  it('finds ガク and コウ in 学校 がっこう', () => {
    expect(readingsUsedIn('学校', 'がっこう', KANJI_TABLE)).toEqual({ 学: ['ガク'], 校: ['コウ'] });
  });

  it('finds the kun-yomi in 入口 いりぐち', () => {
    expect(readingsUsedIn('入口', 'いりぐち', KANJI_TABLE)).toEqual({
      入: ['い.る'],
      口: ['くち'],
    });
  });

  it('finds nothing for an irregular reading such as 今日 きょう', () => {
    expect(readingsUsedIn('今日', 'きょう', KANJI_TABLE)).toEqual({});
  });
});
