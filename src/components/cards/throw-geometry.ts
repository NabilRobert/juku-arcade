/**
 * The geometry of a throw, kept apart from Vue so it can be tested on its
 * own: which word card a released reading card is aimed at, and how far
 * the thrown card has to fly to reach it. All boxes and points are in the
 * window's coordinates (getBoundingClientRect).
 */

export interface Point {
  x: number;
  y: number;
}

export type Offset = Point;

/** Where a card sits away from its own slot: an offset, and its size there. */
export interface Placement extends Offset {
  scale: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A flung card is aimed where it would be this many seconds after release
 * at its release speed. 0.15 s lets a short flick reach the row of word
 * cards above without a slow drag overshooting it.
 */
export const AIM_AHEAD_S = 0.15;

function centre(box: Box): Point {
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function contains(box: Box, point: Point): boolean {
  const isInsideX = point.x >= box.left && point.x <= box.left + box.width;
  return isInsideX && point.y >= box.top && point.y <= box.top + box.height;
}

/**
 * A press that moves less than this (px) is a click, not a drag. Hands
 * wobble: counting a tiny move as a drag swallowed clicks in the playtest.
 */
export const TAP_SLOP_PX = 10;

/** Whether a press that started at one point and ended at another was a drag. */
export function isDrag(from: Point, to: Point): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) >= TAP_SLOP_PX;
}

/** How far the centre of one box is from the centre of another, in pixels. */
export function centreOffset(from: Box, to: Box): Offset {
  const start = centre(from);
  const end = centre(to);
  return { x: end.x - start.x, y: end.y - start.y };
}

/**
 * How to draw a card from one box as if it sat in another: moved centre to
 * centre, and scaled from one height to the other.
 */
export function placementBetween(from: Box, to: Box): Placement {
  // A box not laid out yet has no height; keep the card its own size rather than divide by zero.
  const scale = from.height > 0 ? to.height / from.height : 1;
  return { ...centreOffset(from, to), scale };
}

/** The word card under a point, if any. */
export function wordUnder(point: Point, words: ReadonlyMap<string, Box>): string | null {
  for (const [wordId, box] of words) {
    if (contains(box, point)) return wordId;
  }
  return null;
}

/**
 * The word card a released card is aimed at: the one it was dropped on,
 * or else the one it was flung towards; null when it would miss them all.
 */
export function aimedWord(
  release: Point,
  velocity: Point,
  words: ReadonlyMap<string, Box>,
): string | null {
  const ahead = {
    x: release.x + velocity.x * AIM_AHEAD_S,
    y: release.y + velocity.y * AIM_AHEAD_S,
  };
  return wordUnder(release, words) ?? wordUnder(ahead, words);
}
