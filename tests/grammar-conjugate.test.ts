// Polite and て-forms from OpenJLPT's verb classes, for the written word and its reading alike.
import { describe, expect, it } from 'vitest';
import { conjugatePolite, conjugateTe, type Verb } from '../src/grammar/conjugate.ts';

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

describe('the て-form', () => {
  it('adds て to an ichidan verb’s stem', () => {
    expect(conjugateTe(verb('食べる', 'たべる', 'v1'))).toEqual({
      word: '食べて',
      reading: 'たべて',
    });
  });

  it('follows each godan ending', () => {
    const forms = [
      verb('買う', 'かう', 'v5u'),
      verb('待つ', 'まつ', 'v5t'),
      verb('帰る', 'かえる', 'v5r'),
      verb('遊ぶ', 'あそぶ', 'v5b'),
      verb('歩く', 'あるく', 'v5k'),
      verb('話す', 'はなす', 'v5s'),
    ].map((each) => conjugateTe(each).word);
    expect(forms).toEqual(['買って', '待って', '帰って', '遊んで', '歩いて', '話して']);
  });

  it('makes 行く 行って, not 行いて', () => {
    expect(conjugateTe(verb('行く', 'いく', 'v5k-s'))).toEqual({
      word: '行って',
      reading: 'いって',
    });
  });

  it('keeps 来 but reads it き', () => {
    expect(conjugateTe(verb('来る', 'くる', 'vk'))).toEqual({ word: '来て', reading: 'きて' });
  });
});
