// Furigana on the kanji only: the kana a word and its reading share stay bare.
import { describe, expect, it } from 'vitest';
import { kanjiFurigana } from '../src/grammar/kanji-furigana.ts';

describe('furigana on the kanji only', () => {
  it('leaves a conjugated verb’s kana tail bare', () => {
    expect(kanjiFurigana('起きます', 'おきます')).toBe('{起|お}きます');
  });

  it('lines up kana before and after the kanji', () => {
    expect(kanjiFurigana('お母さん', 'おかあさん')).toBe('お{母|かあ}さん');
  });

  it('gives each kanji run its own reading around kana in the middle', () => {
    expect(kanjiFurigana('食べ物', 'たべもの')).toBe('{食|た}べ{物|もの}');
  });

  it('adds nothing to a word with no kanji', () => {
    expect(kanjiFurigana('パン', 'パン')).toBe('パン');
    // Even when the reading is written in the other kana: kana never gets furigana.
    expect(kanjiFurigana('ケーキ', 'けーき')).toBe('ケーキ');
  });

  it('puts the reading over the whole word when it won’t line up', () => {
    expect(kanjiFurigana('今日は', 'きょうわ')).toBe('{今日は|きょうわ}');
  });
});
