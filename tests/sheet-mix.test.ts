// Kanji mode's balance (D67): review every third kanji, learning the level's list first, and a goal
// that counts only the level's official kanji list.
import { describe, expect, it } from 'vitest';
import type { Deck, JlptLevel, KanjiNote } from '../src/deck/types.ts';
import { dealKanjiRound, kanjiPool } from '../src/kanji/kanji-round.ts';
import {
  candidatesOfKind,
  kindForRound,
  LIST_SHARE,
  REVIEW_EVERY,
  type KanjiStanding,
} from '../src/kanji/sheet-mix.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

function note(listLevel: JlptLevel | null): KanjiNote {
  return { onyomi: ['ア'], kunyomi: [], meanings: [], words: [], listLevel };
}

function used(id: string, word: string, readings: Record<string, string[]>) {
  return { ...deckWord(id, word, ''), kanjiReadingsUsed: readings };
}

/** 日 and 山 are on the N5 list; 欲 is an N2 kanji an N5 word uses; 込 is on no list. */
const DECK: Deck = {
  level: 'N5',
  sourceCommit: 'test',
  kanji: { 日: note('N5'), 山: note('N5'), 欲: note('N2'), 込: note(null) },
  words: [
    used('1', '日', { 日: ['ア'] }),
    used('2', '山', { 山: ['ア'] }),
    used('3', '欲しい', { 欲: ['ア'] }),
    used('4', '込む', { 込: ['ア'] }),
  ],
};

const standing = (mastered: string[]): KanjiStanding => ({
  mastered: new Set(mastered),
  levelList: kanjiPool(DECK).levelList,
});

describe('the kanji goal', () => {
  it("counts only the kanji on the deck level's official list", () => {
    expect([...kanjiPool(DECK).levelList].sort()).toEqual(['山', '日']);
  });
});

describe('the balance of a kanji sheet', () => {
  it('makes every third kanji a review of one already mastered', () => {
    const kinds = [1, 2, 3, 4, 5, 6].map((round) => kindForRound(round, () => 0));
    expect(kinds).toEqual(['list', 'list', 'review', 'list', 'list', 'review']);
    expect(REVIEW_EVERY).toBe(3);
  });

  it("draws a learning kanji from the level's list most of the time, and otherwise from the rest", () => {
    expect(kindForRound(1, () => LIST_SHARE - 0.01)).toBe('list');
    expect(kindForRound(1, () => LIST_SHARE)).toBe('other');
  });

  it('reviews only mastered kanji, and learns only unmastered ones', () => {
    const all = ['日', '山', '欲', '込'];
    expect(candidatesOfKind(all, 'review', standing(['山']))).toEqual(['山']);
    expect(candidatesOfKind(all, 'list', standing(['山']))).toEqual(['日']);
    expect(candidatesOfKind(all, 'other', standing([]))).toEqual(['欲', '込']);
  });

  it('learns instead when nothing is mastered yet, and moves on once the list is all mastered', () => {
    const all = ['日', '山', '欲', '込'];
    expect(candidatesOfKind(all, 'review', standing([]))).toEqual(['日', '山']);
    expect(candidatesOfKind(all, 'list', standing(['日', '山']))).toEqual(['欲', '込']);
  });

  it('deals the kanji of the kind the sheet asks for', () => {
    const wish = { kind: 'review' as const, standing: standing(['欲']) };
    for (const seed of [1, 2, 3, 4, 5]) {
      expect(dealKanjiRound(kanjiPool(DECK), seededRandom(seed), [], wish).kanji).toBe('欲');
    }
  });
});
