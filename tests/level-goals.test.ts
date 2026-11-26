import { describe, expect, it } from 'vitest';
import {
  grammarGoal,
  kanjiGoal,
  masteredKanji,
  rakugoRank,
  stampsReached,
  wordGoal,
} from '../src/memory/level-goals.ts';
import { answer } from './helpers/events.ts';
import { deckWord } from './helpers/fixtures.ts';
import { sentence } from './helpers/grammar-events.ts';

describe('the level goals', () => {
  it('counts a word as known once it was right on two separate days', () => {
    const words = [deckWord('w1', '学校', 'がっこう'), deckWord('w2', '先生', 'せんせい')];
    const events = [
      answer('w1', '2026-11-24', 'clean'),
      answer('w1', '2026-11-25', 'clean'),
      answer('w2', '2026-11-25', 'clean'),
    ];
    expect(wordGoal(words, events)).toEqual({ label: 'Words known', done: 1, total: 2 });
  });

  it('masters a kanji found perfectly on two separate days, not twice in one', () => {
    const rounds = [
      { day: '2026-11-24', kanji: '学', isPerfect: true },
      { day: '2026-11-25', kanji: '学', isPerfect: true },
      { day: '2026-11-25', kanji: '生', isPerfect: true },
      { day: '2026-11-25', kanji: '生', isPerfect: true },
      { day: '2026-11-24', kanji: '日', isPerfect: false },
      { day: '2026-11-25', kanji: '日', isPerfect: true },
    ];
    expect(masteredKanji(rounds)).toEqual(new Set(['学']));
    expect(kanjiGoal(['学', '生', '日', '本'], rounds)).toMatchObject({ done: 1, total: 4 });
  });

  it('stamps each quarter of a goal reached', () => {
    const goal = (done: number) => ({ label: '', done, total: 100 });
    expect([0, 24, 25, 60, 99, 100].map((done) => stampsReached(goal(done)))).toEqual([
      0, 0, 1, 2, 3, 4,
    ]);
  });

  it('ranks a storyteller 前座, then 二ツ目 from a third of the grammar, then 真打 for all of it', () => {
    expect([0, 6, 7, 19, 20].map((known) => rakugoRank(known, 20))).toEqual([
      '前座',
      '前座',
      '二ツ目',
      '二ツ目',
      '真打',
    ]);
  });

  it('counts grammar points known from the grammar log, and ranks by them', () => {
    const events = [sentence('wa', '2026-11-24', 'right'), sentence('wa', '2026-11-25', 'right')];
    expect(grammarGoal(['wa', 'o', 'ni'], events, '2026-11-26')).toEqual({
      label: 'Grammar known',
      done: 1,
      total: 3,
      title: '二ツ目',
    });
  });
});
