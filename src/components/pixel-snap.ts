/**
 * The pixel snap a matched card vanishes with (D38): the card is cut into
 * square blocks, and they blink out one by one in a circle spreading from
 * the top-left corner to the bottom-right, ragged at the edge like dust
 * blowing away, with nothing left behind. PlayCard plays it as a series of
 * masks (Web Animations), each hiding a few more blocks.
 */
import type { RandomSource } from '../game/deal.ts';

/** The card in blocks: 12 across and 16 down, so the blocks are square on a 3:4 card. */
export const SNAP_COLUMNS = 12;
export const SNAP_ROWS = 16;
/** Masks in the animation; each hides the next band of blocks. */
export const SNAP_FRAMES = 14;
/** How ragged the edge is: each block's turn moves by up to this share of the whole snap. */
const SNAP_JITTER = 0.3;

/**
 * When each block vanishes, from 0 (first) to 1 (last): its distance from
 * the top-left corner, plus some randomness so the edge isn't a clean arc.
 */
export function snapOrder(random: RandomSource): number[][] {
  const farthest = Math.hypot(SNAP_COLUMNS, SNAP_ROWS);
  const turns: number[][] = [];
  for (let row = 0; row < SNAP_ROWS; row += 1) {
    const rowTurns: number[] = [];
    for (let column = 0; column < SNAP_COLUMNS; column += 1) {
      const distance = Math.hypot(column + 0.5, row + 0.5) / farthest;
      const turn = distance * (1 - SNAP_JITTER) + random() * SNAP_JITTER;
      rowTurns.push(Math.min(turn, 1));
    }
    turns.push(rowTurns);
  }
  return turns;
}

/** One mask: an SVG with a black square for each block still showing (black shows, empty hides). */
function maskFor(turns: number[][], shownAfter: number): string {
  let squares = '';
  turns.forEach((rowTurns, row) => {
    rowTurns.forEach((turn, column) => {
      if (turn > shownAfter) squares += `M${column} ${row}h1v1h-1z`;
    });
  });
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SNAP_COLUMNS} ${SNAP_ROWS}" ` +
    `preserveAspectRatio="none" shape-rendering="crispEdges"><path d="${squares}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** The masks, first (every block showing) to last (none). */
export function snapMasks(turns: number[][]): string[] {
  const masks: string[] = [];
  for (let frame = 0; frame <= SNAP_FRAMES; frame += 1)
    masks.push(maskFor(turns, frame / SNAP_FRAMES));
  return masks;
}
