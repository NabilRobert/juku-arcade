import { describe, expect, it } from 'vitest';
import { isLongVowelPair, isPronounceable, toHiragana } from '../src/deck/kana.ts';

describe('kana', () => {
  it('turns katakana on-yomi into hiragana', () => {
    expect(toHiragana('ガッコウ')).toBe('がっこう');
  });

  it('leaves hiragana and kanji alone', () => {
    expect(toHiragana('学ぶまなぶ')).toBe('学ぶまなぶ');
  });

  it('treats こ+う and せ+い as long vowels', () => {
    expect(isLongVowelPair('こ', 'う')).toBe(true);
    expect(isLongVowelPair('せ', 'い')).toBe(true);
    expect(isLongVowelPair('か', 'あ')).toBe(true);
  });

  it('does not treat a vowel after a different row as a long vowel', () => {
    expect(isLongVowelPair('か', 'う')).toBe(false);
    expect(isLongVowelPair('ん', 'い')).toBe(false);
  });

  it('accepts a small っ before a k, s, t or p sound', () => {
    expect(isPronounceable('がっこう')).toBe(true);
  });

  it('rejects a small っ before a sound it cannot double', () => {
    expect(isPronounceable('いっにち')).toBe(false);
  });

  it('rejects a small っ after ん, at the start or at the end', () => {
    expect(isPronounceable('せんっせい')).toBe(false);
    expect(isPronounceable('っか')).toBe(false);
    expect(isPronounceable('かっ')).toBe(false);
  });
});
