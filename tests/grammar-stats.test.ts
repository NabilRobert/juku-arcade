import { describe, expect, it } from 'vitest';
import { grammarStats } from '../src/memory/grammar-stats.ts';
import { sentence } from './helpers/grammar-events.ts';

const TODAY = '2026-11-26';

describe('the grammar stats', () => {
  const events = [
    sentence('wa', '2026-11-25', 'right'),
    sentence('wa', TODAY, 'wrong'),
    sentence('o', TODAY, 'wrong'),
    sentence('o', TODAY, 'timeout'),
    sentence('o', TODAY, 'right'),
  ];

  it('counts right, wrong and timed-out sentences, today and overall', () => {
    const stats = grammarStats(events, TODAY);
    expect(stats.allTime).toEqual({ right: 2, wrong: 2, timedOut: 1 });
    expect(stats.today).toEqual({ right: 1, wrong: 2, timedOut: 1 });
  });

  it('lists the points missed most, a timeout counting as a miss', () => {
    expect(grammarStats(events, TODAY).mostMissed).toEqual([
      { pointId: 'o', misses: 2 },
      { pointId: 'wa', misses: 1 },
    ]);
  });

  it('names the rules wrong orders broke, most common first', () => {
    // The helper gives every wrong order the verb-not-last rule.
    expect(grammarStats(events, TODAY).mistakes).toEqual([
      { name: 'The verb not at the end', count: 2 },
    ]);
  });
});
