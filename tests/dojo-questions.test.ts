// The dojo asks only what the player has met: words matched, kanji found perfectly, grammar built right.
import { describe, expect, it } from 'vitest';
import type { Deck, KanjiNote } from '../src/deck/types.ts';
import {
  availableKinds,
  dojoPools,
  isDojoOpen,
  MIN_DOJO_WORDS,
  judgeCards,
  nextQuestion,
  roundOfWord,
  wordQuestion,
} from '../src/dojo/dojo-questions.ts';
import { kanjiPool } from '../src/kanji/kanji-round.ts';
import { answer } from './helpers/events.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';
import { sentence } from './helpers/grammar-events.ts';

const note = (onyomi: string[], kunyomi: string[]): KanjiNote => ({
  onyomi,
  kunyomi,
  meanings: [],
  words: [],
  listLevel: 'N5',
});
const used = (id: string, word: string, reading: string, readings: Record<string, string[]>) => ({
  ...deckWord(id, word, reading),
  kanjiReadingsUsed: readings,
});

const DECK: Deck = {
  level: 'N5',
  sourceCommit: 'test',
  kanji: {
    生: note(['セイ'], ['う.まれる']),
    学: note(['ガク'], []),
    日: note(['ニチ'], ['ひ']),
    人: note(['ジン'], ['ひと']),
  },
  words: [
    used('1', '先生', 'せんせい', { 生: ['セイ'] }),
    used('2', '学生', 'がくせい', { 学: ['ガク'], 生: ['セイ'] }),
    used('3', '毎日', 'まいにち', { 日: ['ニチ'] }),
    used('4', '人', 'ひと', { 人: ['ひと'] }),
    ...Array.from({ length: 12 }, (_, index) => used(`x${index}`, `語${index}`, `ご${index}`, {})),
  ],
};
const DAY = '2026-11-26';
const empty = { wordEvents: [], kanjiRounds: [], grammarEvents: [] };

describe('what the dojo asks', () => {
  it('opens once enough words have been matched', () => {
    const matched = (count: number) =>
      dojoPools(DECK.words, kanjiPool(DECK), {
        ...empty,
        wordEvents: DECK.words.slice(0, count).map((word) => answer(word.id, DAY, 'clean')),
      });
    expect(isDojoOpen(matched(MIN_DOJO_WORDS - 1))).toBe(false);
    expect(isDojoOpen(matched(MIN_DOJO_WORDS))).toBe(true);
  });

  it('asks only kinds the player has met: kanji found perfectly, grammar built right', () => {
    const pools = dojoPools(DECK.words, kanjiPool(DECK), {
      wordEvents: [answer('1', DAY, 'clean'), answer('2', DAY, 'miss')],
      kanjiRounds: [
        { day: DAY, kanji: '生', isPerfect: true },
        { day: DAY, kanji: '日', isPerfect: false },
      ],
      grammarEvents: [sentence('wa', DAY, 'right'), sentence('o', DAY, 'wrong')],
    });
    expect(pools.words.map((word) => word.id)).toEqual(['1']);
    expect([...pools.kanji]).toEqual(['生']);
    expect(new Set(pools.templates.map((template) => template.point))).toEqual(new Set(['wa']));
    expect(availableKinds(pools)).toEqual(['word', 'kanji', 'grammar']);
  });

  it("offers a word's reading among three wrong ones, its own decoys first", () => {
    const word = DECK.words[0];
    if (word === undefined) throw new Error('the test deck has no words');
    const question = wordQuestion(word, DECK.words, seededRandom(3));
    expect(question.choices).toHaveLength(4);
    expect(new Set(question.choices).size).toBe(4);
    expect(question.choices).toContain('せんせい');
    expect(question.choices).toContain(word.decoys.longVowel);
  });

  it('deals a kanji question on a kanji the player knows, and a grammar question of one sentence', () => {
    const pools = dojoPools(DECK.words, kanjiPool(DECK), {
      wordEvents: [],
      kanjiRounds: [{ day: DAY, kanji: '日', isPerfect: true }],
      grammarEvents: [sentence('wa', DAY, 'right')],
    });
    const random = seededRandom(11);
    const kinds = new Set<string>();
    for (let ask = 0; ask < 30; ask += 1) {
      const question = nextQuestion(pools, random);
      kinds.add(question.kind);
      if (question.kind === 'kanji') expect(question.round.kanji).toBe('日');
      if (question.kind === 'grammar') expect(question.tale.lines).toHaveLength(1);
    }
    expect(kinds).toEqual(new Set(['kanji', 'grammar']));
  });
});

describe('a card question', () => {
  const round = {
    kanji: '生',
    meanings: [],
    cards: [
      { text: 'セイ', isRight: true },
      { text: 'ガク', isRight: false },
      { text: 'う(まれる)', isRight: true },
    ],
  };

  it('is a miss as soon as one wrong card is thrown', () => {
    expect(judgeCards(round, [0, 1])).toBe(false);
  });

  it('is right once every right card is thrown, and open until then', () => {
    expect(judgeCards(round, [0])).toBeNull();
    expect(judgeCards(round, [0, 2])).toBe(true);
  });

  it('lays a word question out as the word over its readings, without its meaning', () => {
    const word = DECK.words[0];
    if (word === undefined) throw new Error('the test deck has no words');
    const laidOut = roundOfWord(wordQuestion(word, DECK.words, seededRandom(5)));
    expect(laidOut.kanji).toBe('先生');
    expect(laidOut.meanings).toEqual([]);
    expect(laidOut.cards.filter((card) => card.isRight).map((card) => card.text)).toEqual([
      'せんせい',
    ]);
  });
});
