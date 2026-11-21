/**
 * Learned difficulty (R5, decision D6): each word's chance of being missed
 * starts from the deck's guess and moves with the player's own record. Tags
 * then come from each word's rank within the deck, in fifths (tags.ts).
 */
import type { DeckWord } from '../deck/types.ts';
import { tagsByRank, type TagTable } from '../game/tags.ts';
import { GUESS_WEIGHT } from '../game/tuning.ts';
import type { Memory } from './word-memory.ts';

export function learnedMissChance(word: DeckWord, memory: Memory): number {
  const record = memory.words.get(word.id);
  if (record === undefined) return word.missChanceGuess;
  return (record.misses + GUESS_WEIGHT * word.missChanceGuess) / (record.attempts + GUESS_WEIGHT);
}

export function learnedTags(words: readonly DeckWord[], memory: Memory): TagTable {
  return tagsByRank(
    words.map((word) => ({ ...word, missChanceGuess: learnedMissChance(word, memory) })),
  );
}
