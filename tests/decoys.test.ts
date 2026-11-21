import { describe, expect, it } from 'vitest';
import {
  dakutenDecoys,
  longVowelDecoys,
  smallTsuDecoys,
  smallYoonDecoys,
} from '../src/deck/decoys.ts';

describe('decoys', () => {
  it('shortens a long vowel first', () => {
    expect(longVowelDecoys('がっこう')[0]).toBe('がっこ');
  });

  it('lengthens a short お sound when there is no long vowel', () => {
    expect(longVowelDecoys('ここ')).toContain('こうこ');
  });

  it('drops a small っ first', () => {
    expect(smallTsuDecoys('がっこう')[0]).toBe('がこう');
  });

  it('adds a small っ before a sound that can double', () => {
    expect(smallTsuDecoys('いた')).toEqual(['いった']);
  });

  it('voices and unvoices kana', () => {
    expect(dakutenDecoys('はし')).toEqual(expect.arrayContaining(['ばし', 'ぱし', 'はじ']));
    expect(dakutenDecoys('かぎ')).toContain('かき');
  });

  it('makes a small ゃゅょ full size', () => {
    expect(smallYoonDecoys('きょう')).toEqual(['きよう']);
  });

  it('makes a full-size やゆよ small only after a kana that takes it', () => {
    expect(smallYoonDecoys('きや')).toEqual(['きゃ']);
    expect(smallYoonDecoys('あや')).toEqual([]);
  });
});
