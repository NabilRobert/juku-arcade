/**
 * Every number the playtest may tune, in one place (phase 2 intro).
 * Each one points to the requirement it comes from.
 */

/** L5: levels run from 1 to 5. */
export const MAX_LEVEL = 5;

/** L5: the level goes up each time the combo reaches a multiple of this. */
export const COMBO_PER_LEVEL = 10;

/** L6: seconds per set at levels 1 to 5 (about 8 s per card down to 2.5 s). */
export const SET_SECONDS_BY_LEVEL = [40, 30, 22, 17, 12] as const;

/** L7: chips for each clean match, and for each whole second left when a set clears. */
export const CHIPS_PER_CLEAN_MATCH = 10;
export const CHIPS_PER_SECOND_LEFT = 1;

/** L8: difficulty tags from easiest to hardest. Words get them by rank within their level. */
export const TAG_STEPS = [0.1, 0.2, 0.3, 0.4, 0.5] as const;

/** How long a cleared set's score shows before the next deal. */
export const CLEARED_PAUSE_MS = 1200;

/** How long a timed-out set shows its answers: long enough to read all five (L6). */
export const TIMED_OUT_PAUSE_MS = 3000;

/** R3: at most this many missed or peeked words come back in the next set, so new words still flow. */
export const MAX_COMEBACKS_PER_SET = 3;

/** L9: the missed tray holds this run's latest missed words. */
export const MISSED_TRAY_SIZE = 8;

/** How long a wrong tap shows the right answer. */
export const WRONG_FLASH_MS = 900;

/** L10: new words in each day's deck, on top of the reviews due. */
export const NEW_WORDS_PER_DAY = 10;

/** R5: how many attempts the starting guess is worth against the player's own record. */
export const GUESS_WEIGHT = 5;

/**
 * L11: endless play deals from the player's weakest seen words plus one new
 * word, so about 5 sets in 7 bring something new.
 */
export const ENDLESS_WEAK_WORDS = 6;
export const ENDLESS_NEW_WORDS = 1;

/** A pool smaller than this can't always deal a valid set (L2), so it's topped up. */
export const MIN_POOL_SIZE = 8;
