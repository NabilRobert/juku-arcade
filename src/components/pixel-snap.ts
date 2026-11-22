/**
 * The pixel snap a matched card vanishes with (D38): the card is cut into
 * square blocks, and they blink out one by one in a curved front sweeping
 * from the top-left corner to the bottom-right, ragged at the edge like
 * dust blowing away, with nothing left behind. The left side always goes
 * before the right. PlayCard plays it as a series of
 * masks (Web Animations), each hiding a few more blocks.
 */
import type { RandomSource } from '../game/deal.ts';

/**
 * The card in blocks: 30 across and 40 down, so the blocks are square on a
 * 3:4 card and small, about the size of the card art's own pixels.
 */
export const SNAP_COLUMNS = 30;
export const SNAP_ROWS = 40;
/** Masks in the animation; each hides the next band of blocks. */
export const SNAP_FRAMES = 24;
/** How ragged the edge is: each block's turn moves by up to this share of the whole snap. */
const SNAP_JITTER = 0.1;
/**
 * How much going down counts against going across. Below 1, the front
 * sweeps left to right with a curve from the top-left, so a block on the
 * right never goes before the left side has.
 */
const DOWN_WEIGHT = 0.6;

/**
 * When each block vanishes, from 0 (first) to 1 (last): its distance from
 * the top-left corner, with across counting more than down, plus a little
 * randomness so the edge isn't a clean arc.
 */
export function snapOrder(random: RandomSource): number[][] {
  const farthest = Math.hypot(1, DOWN_WEIGHT);
  const turns: number[][] = [];
  for (let row = 0; row < SNAP_ROWS; row += 1) {
    const rowTurns: number[] = [];
    for (let column = 0; column < SNAP_COLUMNS; column += 1) {
      const across = (column + 0.5) / SNAP_COLUMNS;
      const down = ((row + 0.5) / SNAP_ROWS) * DOWN_WEIGHT;
      const distance = Math.hypot(across, down) / farthest;
      const turn = distance * (1 - SNAP_JITTER) + random() * SNAP_JITTER;
      rowTurns.push(Math.min(turn, 1));
    }
    turns.push(rowTurns);
  }
  return turns;
}

/** The blocks still showing in one row, as runs of neighbours, each drawn as one rectangle. */
function rowRuns(rowTurns: number[], row: number, shownAfter: number): string {
  let path = '';
  let runStart = -1;
  rowTurns.forEach((turn, column) => {
    const isShown = turn > shownAfter;
    if (isShown && runStart === -1) runStart = column;
    const isRunOver = runStart !== -1 && (!isShown || column === rowTurns.length - 1);
    if (!isRunOver) return;
    const runEnd = isShown ? column + 1 : column;
    path += `M${runStart} ${row}h${runEnd - runStart}v1H${runStart}z`;
    runStart = -1;
  });
  return path;
}

/** One mask, as a data URL: an SVG of the blocks still showing (black shows the card, empty hides it). */
function maskFor(turns: number[][], shownAfter: number): string {
  const path = turns.map((rowTurns, row) => rowRuns(rowTurns, row, shownAfter)).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SNAP_COLUMNS} ${SNAP_ROWS}" ` +
    `preserveAspectRatio="none" shape-rendering="crispEdges"><path d="${path}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** The masks, first (every block showing) to last (none). */
export function snapMasks(turns: number[][]): string[] {
  const masks: string[] = [];
  for (let frame = 0; frame <= SNAP_FRAMES; frame += 1)
    masks.push(maskFor(turns, frame / SNAP_FRAMES));
  return masks;
}
