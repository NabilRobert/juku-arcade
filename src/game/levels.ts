/**
 * Level rules (L5, decision D2): up one level each time the combo reaches a
 * multiple of 10; down one on a miss or timeout, except that level 5 drops
 * straight to level 1.
 */
import { COMBO_PER_LEVEL, MAX_LEVEL, SET_SECONDS_BY_LEVEL } from './tuning.ts';

export const FIRST_LEVEL = 1;

/** The level after a correct match has taken the combo to `comboAfterMatch`. */
export function levelAfterMatch(level: number, comboAfterMatch: number): number {
  const reachedMilestone = comboAfterMatch > 0 && comboAfterMatch % COMBO_PER_LEVEL === 0;
  return reachedMilestone ? Math.min(level + 1, MAX_LEVEL) : level;
}

/** The level after a miss or a timeout. */
export function levelAfterMiss(level: number): number {
  if (level === MAX_LEVEL) return FIRST_LEVEL;
  return Math.max(level - 1, FIRST_LEVEL);
}

/** How long a set dealt at this level lasts, in milliseconds (L6). */
export function setDurationMs(level: number): number {
  const seconds = SET_SECONDS_BY_LEVEL[level - 1] ?? SET_SECONDS_BY_LEVEL[0];
  return seconds * 1000;
}
