// Kanji mode: one kanji, a hand of readings, and every right reading to find.
import { describe, expect, it } from 'vitest';
import type { Deck, KanjiNote } from '../src/deck/types.ts';
import {
  CARDS_PER_ROUND,
  dealKanjiRound,
  kanjiPool,
  PERFECT_ROUND_BONUS,
  POINTS_PER_HIT,
  scoreRound,
  type KanjiRound,
} from '../src/kanji/kanji-round.ts';
import { readingsUsedByKanji, toKanjiReading } from '../src/kanji/readings.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

function note(onyomi: string[], kunyomi: string[]): KanjiNote {
  return { onyomi, kunyomi, meanings: [], words: [] };
}

function used(id: string, word: string, readings: Record<string, string[]>) {
  return { ...deckWord(id, word, ''), kanjiReadingsUsed: readings };
}

const DECK: Deck = {
  level: 'N5',
  sourceCommit: 'test',
  kanji: {
    生: note(['セイ', 'ショウ'], ['い.きる', 'う.まれる', 'き']),
    学: note(['ガク'], ['まな.ぶ']),
    日: note(['ニチ', 'ジツ'], ['ひ', '-び']),
    人: note(['ジン', 'ニン'], ['ひと']),
    山: note(['サン'], ['やま']),
  },
  words: [
    used('1', '先生', { 生: ['セイ'] }),
    used('2', '生まれる', { 生: ['う.まれる', 'うまれる'] }),
    used('3', '学生', { 学: ['ガク'], 生: ['セイ'] }),
    used('4', '毎日', { 日: ['ニチ'] }),
    used('5', '日曜日', { 日: ['ニチ', '-び'] }),
    used('6', '人', { 人: ['ひと'] }),
    used('7', '三人', { 人: ['ニン'] }),
    used('8', '山', { 山: ['やま'] }),
    used('9', '富士山', { 山: ['サン'] }),
  ],
};

describe('kanji readings on a card', () => {
  it('shows okurigana in brackets and drops the prefix and suffix hyphens', () => {
    expect(toKanjiReading('まな.ぶ')).toEqual({ shown: 'まな(ぶ)', plain: 'まなぶ' });
    expect(toKanjiReading('-び').shown).toBe('び');
    expect(toKanjiReading('ガク').shown).toBe('ガク');
  });

  it("counts only the readings this level's words use, each once", () => {
    const readings = readingsUsedByKanji(DECK.words)
      .get('生')
      ?.map((reading) => reading.shown);
    expect(readings).toEqual(['セイ', 'う(まれる)']);
  });
});

describe('dealing a kanji round', () => {
  it('deals a full hand with every right reading of the kanji in it', () => {
    const round = dealKanjiRound(kanjiPool(DECK), seededRandom(3), []);
    expect(round.cards).toHaveLength(CARDS_PER_ROUND);
    const rights = round.cards.filter((card) => card.isRight).map((card) => card.text);
    const expected = readingsUsedByKanji(DECK.words)
      .get(round.kanji)
      ?.map((r) => r.shown);
    expect(rights.sort()).toEqual([...(expected ?? [])].sort());
  });

  it('never deals a wrong card that is secretly a reading of the kanji', () => {
    const pool = kanjiPool(DECK);
    for (let seed = 1; seed <= 20; seed += 1) {
      const round = dealKanjiRound(pool, seededRandom(seed), ['学', '日', '人', '山']);
      expect(round.kanji).toBe('生');
      const wrongs = round.cards.filter((card) => !card.isRight).map((card) => card.text);
      expect(wrongs).not.toContain('ショウ');
      expect(new Set(round.cards.map((card) => card.text)).size).toBe(round.cards.length);
    }
  });

  it('picks kanji with more readings more often, so rounds often have several right answers', () => {
    const busy = used('b', '生', { 生: ['セイ', 'ショウ', 'い.きる', 'う.まれる'] });
    const pool = kanjiPool({ ...DECK, words: [busy, used('q', '学', { 学: ['ガク'] })] });
    const random = seededRandom(5);
    let busyPicks = 0;
    for (let round = 0; round < 500; round += 1) {
      if (dealKanjiRound(pool, random, []).kanji === '生') busyPicks += 1;
    }
    // Weights 4 to 1: 生 should come up about four rounds in five, not one in two.
    expect(busyPicks / 500).toBeGreaterThan(0.7);
  });

  it('skips the kanji shown in the last few rounds', () => {
    const round = dealKanjiRound(kanjiPool(DECK), seededRandom(1), ['生', '学', '日', '人']);
    expect(round.kanji).toBe('山');
  });
});

describe('scoring a kanji round', () => {
  const round: KanjiRound = {
    kanji: '生',
    meanings: [],
    cards: [
      { text: 'セイ', isRight: true },
      { text: 'ガク', isRight: false },
      { text: 'う(まれる)', isRight: true },
    ],
  };

  it('gives a bonus when every right reading is picked and nothing else', () => {
    expect(scoreRound(round, [0, 2])).toMatchObject({
      hits: 2,
      isPerfect: true,
      points: 2 * POINTS_PER_HIT + PERFECT_ROUND_BONUS,
    });
  });

  it('counts wrong picks and right readings left in the hand', () => {
    expect(scoreRound(round, [0, 1])).toMatchObject({
      hits: 1,
      wrongPicks: 1,
      misses: 1,
      isPerfect: false,
      points: POINTS_PER_HIT,
    });
  });
});
