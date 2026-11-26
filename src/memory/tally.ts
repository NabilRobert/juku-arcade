/**
 * Counting what comes up most: the stats page's most-missed words and
 * mistake kinds, the grammar points missed most, and a learner report's
 * usual wrong pick all count items and sort them by count.
 */

/** Each distinct item with how often it appears, most common first (a tie keeps first-seen order). */
export function tally<T>(items: Iterable<T>): [T, number][] {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]);
}
