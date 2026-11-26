/**
 * Whether the start screen's leaderboard and streak panels are folded down
 * to their headline (playtest decision, 2026-11-26), remembered in this
 * browser so the start screen opens the way the player left it. Both open
 * by default.
 */
import { PREFERENCE_KEYS } from './preference-keys.ts';
import { storedFlag } from './stored-flag.ts';

const leaderboard = storedFlag(PREFERENCE_KEYS.leaderboardFolded, false);
export const isLeaderboardFolded = leaderboard.isOn;
export const setLeaderboardFolded = leaderboard.set;

const streak = storedFlag(PREFERENCE_KEYS.streakFolded, false);
export const isStreakFolded = streak.isOn;
export const setStreakFolded = streak.set;
