/**
 * Progress the game keeps in this browser's localStorage rather than in
 * its database (storage.ts): the best scores, Bunpou's haiku
 * collection, and the streak's last reminder and milestone. They're named here, in one list, so "Delete my data" clears
 * every one of them (storage.ts: deleteAllData) and a new one can't be
 * missed. Preferences (sound, hints, furigana) aren't progress, so a
 * delete keeps them.
 */

/** Word mode's best bank run (banked coins, D46). */
export const BANK_BEST_KEY = 'juku-arcade:best-bank-score';
/** Bunpou's best run (total score, D59). */
export const BUNPOU_BEST_KEY = 'juku-arcade:best-bunpou-score';
/** Bunpou's haiku collection and this round's haiku (D59). */
export const HAIKU_KEY = 'juku-arcade:haiku';

/** The streak reminder shown last, so the next visit picks another (streak-messages.ts). */
export const LAST_STREAK_MESSAGE_KEY = 'juku-arcade:last-streak-message';
/** The day a streak milestone was last celebrated, so it's celebrated once. */
export const STREAK_CELEBRATED_KEY = 'juku-arcade:streak-celebrated';

export const PROGRESS_KEYS: readonly string[] = [
  BANK_BEST_KEY,
  BUNPOU_BEST_KEY,
  HAIKU_KEY,
  LAST_STREAK_MESSAGE_KEY,
  STREAK_CELEBRATED_KEY,
];
