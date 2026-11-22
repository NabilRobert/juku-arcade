// The swirling table loops: the end of one loop is the start of the next.
import { describe, expect, it } from 'vitest';
import { SWIRL_LOOP_MS, swirlPhase } from '../src/background/swirl-shader.ts';

describe('the swirling table', () => {
  it('starts each loop at phase 0 and reaches halfway at half a loop', () => {
    expect(swirlPhase(0)).toBe(0);
    expect(swirlPhase(SWIRL_LOOP_MS / 2)).toBeCloseTo(Math.PI);
  });

  it('comes back to where it started after a whole loop', () => {
    expect(swirlPhase(SWIRL_LOOP_MS * 3 + 1000)).toBeCloseTo(swirlPhase(1000));
  });
});
