/**
 * The game's logo as pixel art (D40): 塾 in a red ring on white, like a
 * hanko seal. This works out the ring and the white disc inside it on a
 * small grid, as SVG paths of whole pixels, so the circle has the stepped
 * edge of pixel art. PixelSeal.vue draws them and puts 塾 on top.
 */

/** The seal is drawn on a grid this many pixels across. */
export const SEAL_GRID = 24;
/** How thick the ring is, in pixels. */
const RING_PIXELS = 1.6;

/** A run of neighbouring pixels in one row, as an SVG path piece. */
function run(row: number, start: number, end: number): string {
  return `M${start} ${row}h${end - start}v1H${start}z`;
}

/** The pixels whose centres fall within a band of distances from the middle, row by row. */
function band(inner: number, outer: number): string {
  const middle = SEAL_GRID / 2;
  let path = '';
  for (let row = 0; row < SEAL_GRID; row += 1) {
    let start = -1;
    for (let column = 0; column <= SEAL_GRID; column += 1) {
      const distance = Math.hypot(column + 0.5 - middle, row + 0.5 - middle);
      const isIn = column < SEAL_GRID && distance >= inner && distance <= outer;
      if (isIn && start === -1) start = column;
      if (!isIn && start !== -1) {
        path += run(row, start, column);
        start = -1;
      }
    }
  }
  return path;
}

const OUTER = SEAL_GRID / 2 - 0.1;

/** The red ring, and the white disc inside it. */
export const SEAL_RING = band(OUTER - RING_PIXELS, OUTER);
export const SEAL_DISC = band(0, OUTER - RING_PIXELS - 0.01);
