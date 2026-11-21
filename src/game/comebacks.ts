/**
 * Short-term memory within a run: missed and peeked words come back soon
 * (R3), and missed words collect in the tray (L9). The long-term schedule
 * across days is the review engine's job (slice 3).
 */
import type { DeckWord } from '../deck/types.ts';
import { MISSED_TRAY_SIZE } from './tuning.ts';

export function withComeback(comebackWordIds: readonly string[], wordId: string): string[] {
  return comebackWordIds.includes(wordId) ? [...comebackWordIds] : [...comebackWordIds, wordId];
}

/** The tray with this word at the front, without duplicates, capped at its size. */
export function withTrayWord(tray: readonly DeckWord[], word: DeckWord): DeckWord[] {
  return [word, ...tray.filter((other) => other.id !== word.id)].slice(0, MISSED_TRAY_SIZE);
}
