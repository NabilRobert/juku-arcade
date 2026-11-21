/**
 * Difficulty tags (L8, decision D6) from the deck's starting guess.
 *
 * Tags come from a word's rank within its level, in fifths: the easiest
 * fifth gets +0.1×, the hardest +0.5×. The N5 guess only spans 0.15 to 0.37,
 * so mapping the guess itself would tag almost every card +0.1× (slice 0
 * spike, finding 5). Learned tags replace this in slice 3.
 */
import type { DeckWord } from '../deck/types.ts';
import { TAG_STEPS } from './tuning.ts';

export type TagTable = ReadonlyMap<string, number>;

export function tagsByRank(words: readonly DeckWord[]): TagTable {
  const byGuess = [...words].sort(
    (a, b) => a.missChanceGuess - b.missChanceGuess || a.id.localeCompare(b.id),
  );
  const tags = new Map<string, number>();
  byGuess.forEach((word, rank) => {
    const step = Math.floor((rank * TAG_STEPS.length) / byGuess.length);
    tags.set(word.id, TAG_STEPS[step] ?? TAG_STEPS[0]);
  });
  return tags;
}
