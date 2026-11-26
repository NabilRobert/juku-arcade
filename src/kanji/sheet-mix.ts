/**
 * Which kind of kanji each round of kanji mode draws (D67), so a sheet
 * balances learning with review (playtest decision, 2026-11-26):
 *
 * - every REVIEW_EVERY-th kanji is one the player has mastered, so it
 *   stays fresh;
 * - the rest are kanji still being learned: from the level's official
 *   kanji list LIST_SHARE of the time, so the kanji goal fills, and
 *   otherwise from the level's other kanji, which its words use too.
 *
 * When a kind has nothing left to show (nothing mastered yet, or the list
 * all mastered), the next kind in FALLBACKS stands in.
 */
import type { RandomSource } from '../game/deal.ts';

export type KanjiKind = 'review' | 'list' | 'other';

/** In a sheet of 10, rounds 3, 6 and 9 are review: 3 review to 7 learning. */
export const REVIEW_EVERY = 3;
/** Of the learning rounds, the share drawn from the level's official list. */
export const LIST_SHARE = 0.75;

const FALLBACKS: Readonly<Record<KanjiKind, readonly KanjiKind[]>> = {
  review: ['review', 'list', 'other'],
  list: ['list', 'other', 'review'],
  other: ['other', 'list', 'review'],
};

/** What a sheet knows about the player: the kanji they've mastered, and the level's list. */
export interface KanjiStanding {
  mastered: ReadonlySet<string>;
  levelList: ReadonlySet<string>;
}

/** The kind of kanji the round with this number (counting from 1) should draw. */
export function kindForRound(roundNumber: number, random: RandomSource): KanjiKind {
  if (roundNumber % REVIEW_EVERY === 0) return 'review';
  return random() < LIST_SHARE ? 'list' : 'other';
}

export function kindOf(kanji: string, standing: KanjiStanding): KanjiKind {
  if (standing.mastered.has(kanji)) return 'review';
  return standing.levelList.has(kanji) ? 'list' : 'other';
}

/** The candidates of the wanted kind, or of the first fallback kind that has any. */
export function candidatesOfKind(
  candidates: readonly string[],
  wanted: KanjiKind,
  standing: KanjiStanding,
): string[] {
  for (const kind of FALLBACKS[wanted]) {
    const ofKind = candidates.filter((kanji) => kindOf(kanji, standing) === kind);
    if (ofKind.length > 0) return ofKind;
  }
  return [...candidates];
}
