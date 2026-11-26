/**
 * Mulberry32: a tiny seeded random generator, so shuffles and bootstrap
 * resamples repeat exactly (tests, and the report script's intervals).
 */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** One of `items`, picked at random, or undefined when there are none. */
export function pickOne<T>(items: readonly T[], random: () => number = Math.random): T | undefined {
  return items[Math.floor(random() * items.length)];
}
