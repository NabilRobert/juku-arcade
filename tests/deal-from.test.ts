import { describe, expect, it } from 'vitest';
import { placementBetween } from '../src/components/cards/throw-geometry.ts';
import { belowScreen } from '../src/composables/useDeal.ts';

describe('dealing on a phone, with no deck', () => {
  it('slides a card straight up from just under the screen, at its own size', () => {
    const slot = { left: 40, top: 300, width: 90, height: 120 };
    const from = belowScreen(slot, 812);
    expect(from).toEqual({ left: 40, top: 812, width: 90, height: 120 });
    expect(placementBetween(slot, from)).toEqual({ x: 0, y: 512, scale: 1 });
  });
});
