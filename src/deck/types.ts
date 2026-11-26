/**
 * The shape of a deck file (public/decks/n5.json and so on).
 *
 * scripts/build-decks.ts writes these files from OpenJLPT, and the game
 * reads them. Both import this file, so the two can't drift apart.
 */

export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JlptLevel = (typeof JLPT_LEVELS)[number];

/**
 * The kinds of mistake a decoy reading tests (requirement R8, decision D27).
 * "Look-alike kanji" is missing on purpose: OpenJLPT has no kanji component
 * data, so it can't be computed (slice 0 spike, docs/spikes/slice-0-decks.md).
 */
export const DECOY_TYPES = [
  'longVowel',
  'smallTsu',
  'dakuten',
  'smallYoon',
  'otherReading',
] as const;
export type DecoyType = (typeof DECOY_TYPES)[number];

export interface DeckWord {
  /** OpenJLPT's stable word ID. */
  id: string;
  /** The word as written, with kanji: 学校. */
  word: string;
  /** The reading shown on the reading card: がっこう. */
  reading: string;
  /** Other valid readings; none may appear in the same set (L2). */
  otherReadings: string[];
  /** The starting guess at the chance this word is missed (R5), 0 to 1. */
  missChanceGuess: number;
  /** One wrong reading per decoy type, where the data allows one. */
  decoys: Partial<Record<DecoyType, string>>;
  /** English meanings, for the card's back (L9). */
  meanings: string[];
  example: Example | null;
  /**
   * For each kanji in the word, the KANJIDIC2 readings this word uses
   * (学校: 学 → ガク, 校 → コウ), highlighted on the card's back (D29).
   */
  kanjiReadingsUsed: Record<string, string[]>;
}

/** An example sentence from Tatoeba (CC BY 2.0 FR). */
export interface Example {
  /**
   * The sentence, with readings marked where Tatoeba has them:
   * この{学校|がっこう}は… Plain text otherwise. src/deck/furigana.ts parses it.
   */
  text: string;
  english: string;
  tatoebaId: number;
}

/** One kanji's entry for the card's back: all its readings, and other words using it (D29). */
export interface KanjiNote {
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  /** Up to a few other JLPT words that use this kanji, with their readings. */
  words: { word: string; reading: string }[];
  /**
   * The JLPT level whose official kanji list has it, or null when it's on
   * none (a level's words can use kanji from harder levels). The kanji
   * goal counts only the deck level's own list (D67).
   */
  listLevel: JlptLevel | null;
}

export interface Deck {
  level: JlptLevel;
  /** The OpenJLPT commit the deck was built from. */
  sourceCommit: string;
  words: DeckWord[];
  /** Every kanji used by this deck's words. */
  kanji: Record<string, KanjiNote>;
}
