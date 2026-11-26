/**
 * What the dojo asks (D62): only what the player has already met, so it
 * tests rather than teaches. Words they've matched before, as a pick of
 * one reading among four; kanji they've found perfectly at least once, as
 * a kanji-mode hand; and grammar points they've built right, as one
 * Bunpou sentence. Repeats are allowed. Each question's kind is picked at
 * random among the kinds the player has something for.
 */
import type { DeckWord } from '../deck/types.ts';
import { shuffled, type RandomSource } from '../game/deal.ts';
import type { GameEvent } from '../game/events.ts';
import { fillTemplate } from '../grammar/fill.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import { pickSetting, type Tale } from '../grammar/tale.ts';
import { TEMPLATES, type Template } from '../grammar/templates.ts';
import { dealKanjiRound, type KanjiPool, type KanjiRound } from '../kanji/kanji-round.ts';
import type { KanjiRoundRecord } from '../memory/play-log.ts';
import type { QuestionKind } from './dojo-run.ts';

/** Words the player must have met before the dojo opens: enough for varied questions. */
export const MIN_DOJO_WORDS = 10;
const CHOICES_PER_WORD = 4;
/** Deals tried to land on a kanji the player knows; far more than a fair pool needs. */
const MAX_KANJI_DEALS = 60;

export interface WordQuestion {
  kind: 'word';
  word: DeckWord;
  /** The reading, and three wrong ones, in random order. */
  choices: string[];
}
export interface KanjiQuestion {
  kind: 'kanji';
  round: KanjiRound;
}
export interface GrammarQuestion {
  kind: 'grammar';
  /** A one-line tale, so Bunpou's rules can run it. */
  tale: Tale;
}
export type DojoQuestion = WordQuestion | KanjiQuestion | GrammarQuestion;

export interface DojoPools {
  /** Words met before; every deck word, for wrong readings. */
  words: readonly DeckWord[];
  allWords: readonly DeckWord[];
  kanjiPool: KanjiPool;
  kanji: ReadonlySet<string>;
  templates: readonly Template[];
}

export function dojoPools(
  allWords: readonly DeckWord[],
  kanjiPool: KanjiPool,
  history: {
    wordEvents: readonly GameEvent[];
    kanjiRounds: readonly KanjiRoundRecord[];
    grammarEvents: readonly GrammarEvent[];
  },
): DojoPools {
  const metIds = new Set(
    history.wordEvents.filter((event) => event.kind === 'match').map((event) => event.word_id),
  );
  const kanji = new Set(
    history.kanjiRounds.filter((round) => round.isPerfect).map((round) => round.kanji),
  );
  const points = new Set(
    history.grammarEvents
      .filter((event) => event.outcome === 'right')
      .map((event) => event.point_id),
  );
  return {
    words: allWords.filter((word) => metIds.has(word.id)),
    allWords,
    kanjiPool,
    kanji: new Set([...kanji].filter((character) => kanjiPool.readings.has(character))),
    // A follow-on line leans on the line before it, so it can't stand alone.
    templates: TEMPLATES.filter(
      (template) => points.has(template.point) && template.followOn !== true,
    ),
  };
}

export const isDojoOpen = (pools: DojoPools): boolean => pools.words.length >= MIN_DOJO_WORDS;

export function availableKinds(pools: DojoPools): QuestionKind[] {
  const kinds: QuestionKind[] = [];
  if (pools.words.length > 0) kinds.push('word');
  if (pools.kanji.size > 0) kinds.push('kanji');
  if (pools.templates.length > 0) kinds.push('grammar');
  return kinds;
}

function pickOne<T>(items: readonly T[], random: RandomSource): T | undefined {
  return items[Math.floor(random() * items.length)];
}

/** The word's reading and three wrong ones: its own decoys first (they test error types), then other words'. */
export function wordQuestion(
  word: DeckWord,
  allWords: readonly DeckWord[],
  random: RandomSource,
): WordQuestion {
  const taken = new Set([word.reading, ...word.otherReadings]);
  const wrong: string[] = [];
  const candidates = [
    ...Object.values(word.decoys),
    ...shuffled(allWords, random).map((other) => other.reading),
  ];
  for (const reading of candidates) {
    if (wrong.length === CHOICES_PER_WORD - 1) break;
    if (reading === undefined || taken.has(reading)) continue;
    taken.add(reading);
    wrong.push(reading);
  }
  return { kind: 'word', word, choices: shuffled([word.reading, ...wrong], random) };
}

function kanjiQuestion(pools: DojoPools, random: RandomSource): KanjiQuestion {
  let round = dealKanjiRound(pools.kanjiPool, random, []);
  for (let deal = 1; deal < MAX_KANJI_DEALS && !pools.kanji.has(round.kanji); deal++) {
    round = dealKanjiRound(pools.kanjiPool, random, []);
  }
  return { kind: 'kanji', round };
}

function grammarQuestion(pools: DojoPools, random: RandomSource): GrammarQuestion | null {
  for (const template of shuffled(pools.templates, random)) {
    const setting = pickSetting(random);
    const sentence = fillTemplate(template, setting);
    if (sentence !== null) return { kind: 'grammar', tale: { setting, lines: [sentence] } };
  }
  return null;
}

/** The next question: a kind the player has something for, then one of it. */
export function nextQuestion(pools: DojoPools, random: RandomSource): DojoQuestion {
  const kind = pickOne(availableKinds(pools), random) ?? 'word';
  if (kind === 'kanji') return kanjiQuestion(pools, random);
  if (kind === 'grammar') {
    const question = grammarQuestion(pools, random);
    if (question !== null) return question;
  }
  const word = pickOne(pools.words, random) ?? pools.allWords[0];
  if (word === undefined) throw new Error('The dojo has no words to ask: the deck is empty.');
  return wordQuestion(word, pools.allWords, random);
}
