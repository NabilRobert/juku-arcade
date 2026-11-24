// Polite verb forms from OpenJLPT's verb classes, for the written word and its reading alike.
import { describe, expect, it } from 'vitest';
import { conjugatePolite, type Verb } from '../src/grammar/conjugate.ts';

const verb = (word: string, reading: string, verbClass: string): Verb => ({
  word,
  reading,
  verbClass,
});

describe('polite forms', () => {
  it('drops る from an ichidan verb', () => {
    expect(conjugatePolite(verb('起きる', 'おきる', 'v1'), 'masu')).toEqual({
      word: '起きます',
      reading: 'おきます',
    });
  });

  it('moves a godan verb to its i-row kana', () => {
    expect(conjugatePolite(verb('買う', 'かう', 'v5u'), 'mashita').word).toBe('買いました');
    expect(conjugatePolite(verb('待つ', 'まつ', 'v5t'), 'masen').word).toBe('待ちません');
    expect(conjugatePolite(verb('帰る', 'かえる', 'v5r'), 'masu').word).toBe('帰ります');
  });

  it('treats 行く and ある as regular godan verbs', () => {
    expect(conjugatePolite(verb('行く', 'いく', 'v5k-s'), 'mashita').word).toBe('行きました');
    expect(conjugatePolite(verb('ある', 'ある', 'v5r-i'), 'masenDeshita').word).toBe(
      'ありませんでした',
    );
  });

  it('keeps 来 but reads it き', () => {
    expect(conjugatePolite(verb('来る', 'くる', 'vk'), 'masenDeshita')).toEqual({
      word: '来ませんでした',
      reading: 'きませんでした',
    });
  });

  it('says which file to change for a class it has no rules for', () => {
    expect(() => conjugatePolite(verb('勉強する', 'べんきょうする', 'vs-i'), 'masu')).toThrow(
      /conjugate\.ts/,
    );
  });
});
