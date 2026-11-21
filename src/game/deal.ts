/**
 * Deals one set: 5 word cards and 6 reading cards (the 5 answers and a
 * decoy), following requirement L2 so that no match is ambiguous.
 *
 * Plain TypeScript with no Vue (decision D12), so the rules are tested on
 * their own. Slice 1 adds the even rotation of decoy types (D27); for now
 * the decoy type is picked at random.
 */
import { DECOY_TYPES, type DecoyType, type DeckWord } from '../deck/types.ts';

export const WORDS_PER_SET = 5;

export interface ReadingCard {
  text: string;
  /** The word this reading belongs to, or null for the decoy. */
  wordId: string | null;
  decoyType: DecoyType | null;
}

export interface DealtSet {
  words: DeckWord[];
  readings: ReadingCard[];
}

/** Returns a number in [0, 1), like Math.random; tests pass a seeded one. */
export type RandomSource = () => number;

export function shuffled<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith] as T, result[index] as T];
  }
  return result;
}

function validReadings(word: DeckWord): string[] {
  return [word.reading, ...word.otherReadings];
}

/** A word can join the set if it shares no spelling and no valid reading with the words in it. */
function canJoin(word: DeckWord, picked: readonly DeckWord[]): boolean {
  const takenReadings = new Set(picked.flatMap(validReadings));
  const sharesSpelling = picked.some((other) => other.word === word.word);
  return !sharesSpelling && validReadings(word).every((reading) => !takenReadings.has(reading));
}

function pickWords(pool: readonly DeckWord[], random: RandomSource): DeckWord[] {
  const picked: DeckWord[] = [];
  for (const word of shuffled(pool, random)) {
    if (canJoin(word, picked)) picked.push(word);
    if (picked.length === WORDS_PER_SET) return picked;
  }
  throw new Error(
    `Can't deal a set: the deck has fewer than ${WORDS_PER_SET} words with different readings.`,
  );
}

/** A decoy that isn't a valid reading of any word in the set. */
function pickDecoy(words: readonly DeckWord[], random: RandomSource): ReadingCard {
  const blocked = new Set(words.flatMap(validReadings));
  for (const word of shuffled(words, random)) {
    for (const type of shuffled(DECOY_TYPES, random)) {
      const text = word.decoys[type];
      if (text !== undefined && !blocked.has(text)) return { text, wordId: null, decoyType: type };
    }
  }
  throw new Error("Can't deal a set: no word in it has a decoy that differs from every reading.");
}

export function dealSet(pool: readonly DeckWord[], random: RandomSource = Math.random): DealtSet {
  const words = pickWords(pool, random);
  const answers = words.map((word) => ({ text: word.reading, wordId: word.id, decoyType: null }));
  const readings = shuffled([...answers, pickDecoy(words, random)], random);
  return { words, readings };
}
