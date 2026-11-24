/**
 * Progress the game keeps in this browser's localStorage rather than in
 * its database (storage.ts): the best scores and Bunpou's haiku
 * collection. They're named here, in one list, so "Delete my data" clears
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

export const PROGRESS_KEYS: readonly string[] = [BANK_BEST_KEY, BUNPOU_BEST_KEY, HAIKU_KEY];
