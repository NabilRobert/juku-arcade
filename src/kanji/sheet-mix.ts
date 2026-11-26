/**
 * Which kind of kanji each round of kanji mode draws (D67), so a sheet
 * balances learning with review (playtest decision, 2026-11-26):
 *
 * - every REVIEW_EVERY-th kanji is one due for review (D75: kanji-reviews.ts);
 * - the rest are new kanji: from the level's official kanji list
 *   LIST_SHARE of the time, so the kanji goal fills, and otherwise from
 *   the level's other kanji, which its words use too.
 *
 * Kanji played but not due yet rest. When a kind has nothing left to show
 * (nothing due, or the list all played), the next kind in FALLBACKS
 * stands in, and resting kanji come last.
 */
import type { RandomSource } from '../game/deal.ts';

/** The kinds a round can ask for; a kanji can also be 'resting', which no round asks for. */
export type KanjiKind = 'review' | 'list' | 'other';
type KanjiClass = KanjiKind | 'resting';

/** In a sheet of 10, rounds 3, 6 and 9 are review: 3 review to 7 learning. */
export const REVIEW_EVERY = 3;
/** Of the learning rounds, the share drawn from the level's official list. */
export const LIST_SHARE = 0.75;

const FALLBACKS: Readonly<Record<KanjiKind, readonly KanjiClass[]>> = {
  review: ['review', 'list', 'other', 'resting'],
  list: ['list', 'other', 'review', 'resting'],
  other: ['other', 'list', 'review', 'resting'],
};

/** What a sheet knows about the player: the kanji due for review, those resting, and the level's list. */
export interface KanjiStanding {
  due: ReadonlySet<string>;
  resting: ReadonlySet<string>;
  levelList: ReadonlySet<string>;
}

/** The kind of kanji the round with this number (counting from 1) should draw. */
export function kindForRound(roundNumber: number, random: RandomSource): KanjiKind {
  if (roundNumber % REVIEW_EVERY === 0) return 'review';
  return random() < LIST_SHARE ? 'list' : 'other';
}

export function kindOf(kanji: string, standing: KanjiStanding): KanjiClass {
  if (standing.due.has(kanji)) return 'review';
  if (standing.resting.has(kanji)) return 'resting';
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
