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

/** How far the centre of one box is from the centre of another, in pixels. */
export function centreOffset(from: Box, to: Box): Offset {
  const start = centre(from);
  const end = centre(to);
  return { x: end.x - start.x, y: end.y - start.y };
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
