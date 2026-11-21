/**
 * Turns one OpenJLPT vocabulary row into a deck word: its decoys and its
 * starting difficulty guess. Pure functions, so they're unit-tested
 * (tests/deck-words.test.ts) without the database.
 */
import {
  dakutenDecoys,
  longVowelDecoys,
  smallTsuDecoys,
  smallYoonDecoys,
} from '../src/deck/decoys.ts';
import { isPronounceable } from '../src/deck/kana.ts';
import { isIrregularReading, isKanji, otherReadingDecoy } from '../src/deck/readings.ts';
import { JLPT_LEVELS, type DecoyType, type DeckWord } from '../src/deck/types.ts';
import type { KanjiRow, VocabRow } from './openjlpt.ts';

/**
 * Starting values for the miss-chance guess (R5). They are judgement, not
 * data: the learned tags replace them as misses come in, and measure S3
 * checks whether the learning beats this guess.
 */
export const DIFFICULTY_GUESS = {
  base: 0.15,
  perLevelStep: 0.05, // N5 adds 0, N1 adds 0.20
  rareKanjiWeight: 0.1, // times the rarest kanji's rarity, 0 to 1
  irregularWeight: 0.15, // jukujikun such as 今日 きょう are much harder
  min: 0.05,
  max: 0.6,
} as const;

/** KANJIDIC2 ranks the 2,500 most used kanji; an unranked kanji counts as rarest. */
const RANKED_KANJI_COUNT = 2500;

function rarestKanjiRarity(word: string, kanjiTable: ReadonlyMap<string, KanjiRow>): number {
  const rarities = [...word].filter(isKanji).map((char) => {
    const rank = kanjiTable.get(char)?.frequencyRank ?? null;
    return rank === null ? 1 : Math.min(rank / RANKED_KANJI_COUNT, 1);
  });
  return Math.max(0, ...rarities);
}

export function missChanceGuess(
  row: VocabRow,
  kanjiTable: ReadonlyMap<string, KanjiRow>,
  isIrregular: boolean,
): number {
  const levelsAboveN5 = JLPT_LEVELS.indexOf(row.level);
  const guess =
    DIFFICULTY_GUESS.base +
    DIFFICULTY_GUESS.perLevelStep * levelsAboveN5 +
    DIFFICULTY_GUESS.rareKanjiWeight * rarestKanjiRarity(row.word, kanjiTable) +
    (isIrregular ? DIFFICULTY_GUESS.irregularWeight : 0);
  const clamped = Math.min(Math.max(guess, DIFFICULTY_GUESS.min), DIFFICULTY_GUESS.max);
  return Math.round(clamped * 100) / 100;
}

export function decoysFor(
  row: VocabRow,
  kanjiTable: ReadonlyMap<string, KanjiRow>,
): Partial<Record<DecoyType, string>> {
  const validReadings = [row.reading, ...row.otherReadings];
  const candidatesByType: Record<DecoyType, string[]> = {
    longVowel: longVowelDecoys(row.reading),
    smallTsu: smallTsuDecoys(row.reading),
    dakuten: dakutenDecoys(row.reading),
    smallYoon: smallYoonDecoys(row.reading),
    otherReading: [otherReadingDecoy(row.word, validReadings, kanjiTable) ?? ''],
  };
  const decoys: Partial<Record<DecoyType, string>> = {};
  for (const [type, candidates] of Object.entries(candidatesByType)) {
    const decoy = candidates.find(
      (candidate) =>
        candidate !== '' && !validReadings.includes(candidate) && isPronounceable(candidate),
    );
    if (decoy !== undefined) decoys[type as DecoyType] = decoy;
  }
  return decoys;
}

/** A deck word, or null for a kana-only word (its reading *is* its spelling, L2). */
export function toDeckWord(
  row: VocabRow,
  kanjiTable: ReadonlyMap<string, KanjiRow>,
): DeckWord | null {
  if (![...row.word].some(isKanji)) return null;
  const isIrregular = isIrregularReading(row.word, row.reading, kanjiTable) ?? false;
  return {
    id: row.id,
    word: row.word,
    reading: row.reading,
    otherReadings: row.otherReadings,
    missChanceGuess: missChanceGuess(row, kanjiTable, isIrregular),
    decoys: decoysFor(row, kanjiTable),
  };
}
