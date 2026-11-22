// A card tilting toward the mouse: the side under the pointer dips away.
import { describe, expect, it } from 'vitest';
import { MAX_TILT_DEG, tiltToward } from '../src/components/card-tilt.ts';

const CARD = { left: 100, top: 100, width: 150, height: 200 };

describe('tilting a card toward the mouse', () => {
  it('stays flat with the pointer at the centre', () => {
    const tilt = tiltToward({ x: 175, y: 200 }, CARD);
    expect(Math.abs(tilt.rotateX)).toBe(0);
    expect(Math.abs(tilt.rotateY)).toBe(0);
  });

  it('leans fully toward a pointer at the right edge or the top edge', () => {
    expect(tiltToward({ x: 250, y: 200 }, CARD).rotateY).toBe(MAX_TILT_DEG);
    expect(tiltToward({ x: 175, y: 100 }, CARD).rotateX).toBe(MAX_TILT_DEG);
  });

  it('leans no further when the pointer is just outside the card', () => {
    expect(tiltToward({ x: 400, y: 200 }, CARD).rotateY).toBe(MAX_TILT_DEG);
  });

  it('stays flat on a card that has no size yet', () => {
    expect(tiltToward({ x: 10, y: 10 }, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
      rotateX: 0,
      rotateY: 0,
    });
  });
});
