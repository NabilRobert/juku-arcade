/**
 * Tilting a card toward the mouse, as a card held up to the light turns
 * to follow your finger (useCardTilt.ts applies it). Kept apart from Vue
 * so the maths can be tested on its own. Points and boxes are in the
 * window's coordinates.
 */
import type { Box, Point } from './throw-geometry.ts';

/** How far a card leans at its edges, in degrees: enough to read as 3D, not enough to hide the text. */
export const MAX_TILT_DEG = 18;

export interface Tilt {
  /** Tips the top toward or away from the player. */
  rotateX: number;
  /** Turns the left or right side toward the player. */
  rotateY: number;
}

export const NO_TILT: Tilt = { rotateX: 0, rotateY: 0 };

/**
 * The tilt for a pointer over a card: the side under the pointer dips
 * away, so the card faces the pointer. Zero at the centre, MAX_TILT_DEG at
 * the edges, and clamped there if the pointer is just outside.
 */
export function tiltToward(pointer: Point, card: Box): Tilt {
  if (card.width === 0 || card.height === 0) return NO_TILT;
  const across = clampHalf((pointer.x - card.left) / card.width - 0.5);
  const down = clampHalf((pointer.y - card.top) / card.height - 0.5);
  return { rotateX: -down * 2 * MAX_TILT_DEG, rotateY: across * 2 * MAX_TILT_DEG };
}

function clampHalf(share: number): number {
  return Math.max(-0.5, Math.min(0.5, share));
}
