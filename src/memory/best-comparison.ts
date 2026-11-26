/**
 * How a finished run compares with the player's best, for the results
 * card: a new best, a tie, or how close it came. People try harder as
 * they near a goal (Kivetz et al. 2006, on the research page), so a miss
 * reads as "3 away", not as a loss. The text
 * is in the interface language, so RunResults calls it while rendering.
 */
import { translate } from '../i18n/index.ts';

export function bestComparison(score: number, previousBest: number): string {
  const best = { best: previousBest };
  if (previousBest <= 0) return score > 0 ? translate('game.results.firstBest') : '';
  if (score > previousBest) return translate('game.results.newBest', best);
  if (score === previousBest) return translate('game.results.tie', best);
  return translate('game.results.away', { ...best, gap: previousBest - score });
}
