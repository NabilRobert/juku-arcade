/**
 * How a finished run compares with the player's best, for the results
 * card: a new best, a tie, or how close it came. Showing how near a run
 * came to the best makes another try appealing (the near-miss effect,
 * Clark et al. 2009), so a miss reads as "3 away", not as a loss.
 */

export function bestComparison(score: number, previousBest: number): string {
  if (previousBest <= 0) return score > 0 ? 'Your first best: beat it next time!' : '';
  if (score > previousBest) return `New best! Up from ${previousBest}.`;
  if (score === previousBest) return `That ties your best (${previousBest}).`;
  return `${previousBest - score} away from your best (${previousBest}).`;
}
