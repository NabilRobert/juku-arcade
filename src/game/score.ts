/**
 * The set score (L7, decision D5): chips × multiplier, where the multiplier
 * is level × (1 + the clean matches' tags added up). Our own formula (D22).
 */
import { CHIPS_PER_CLEAN_MATCH, CHIPS_PER_SECOND_LEFT } from './tuning.ts';

export interface SetScore {
  chips: number;
  multiplier: number;
  total: number;
}

export function scoreSet(
  cleanMatchTags: readonly number[],
  secondsLeft: number,
  level: number,
): SetScore {
  const chips =
    CHIPS_PER_CLEAN_MATCH * cleanMatchTags.length +
    CHIPS_PER_SECOND_LEFT * Math.floor(Math.max(secondsLeft, 0));
  const stackedTags = cleanMatchTags.reduce((sum, tag) => sum + tag, 0);
  // Rounded to one decimal, as the tags are, so 3 × 2.2 shows as 6.6, not 6.6000000000000005.
  const multiplier = Math.round(level * (1 + stackedTags) * 10) / 10;
  return { chips, multiplier, total: Math.round(chips * multiplier) };
}
