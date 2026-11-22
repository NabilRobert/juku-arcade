/**
 * The pixel snap a matched card vanishes with (D38): the card is cut into
 * square blocks, and they blink out one by one in a curved front sweeping
 * from the top-left corner to the bottom-right, ragged at the edge like
 * dust blowing away, with nothing left behind. The left side always goes
 * before the right. usePixelSnap plays it as a series of clip paths
 * (Web Animations), each cutting away a few more blocks. Clip paths, not
 * mask images: a mask image is loaded when it's swapped in, and the card
 * shows unmasked, a flash, until it has loaded.
 */
import type { RandomSource } from '../game/deal.ts';

/**
 * The card in blocks: 30 across and 40 down, so the blocks are square on a
 * 3:4 card and small, about the size of the card art's own pixels.
 */
export const SNAP_COLUMNS = 30;
export const SNAP_ROWS = 40;
/** Steps in the animation; each cuts away the next band of blocks. */
export const SNAP_FRAMES = 24;
/** How ragged the edge is: each block's turn moves by up to this share of the whole snap. */
const SNAP_JITTER = 0.1;
/**
 * How much going down counts against going across. Below 1, the front
 * sweeps left to right with a curve from the top-left, so a block on the
 * right never goes before the left side has.
 */
const DOWN_WEIGHT = 0.6;

/** How far along the front a block is: its distance from the top-left corner, across counting more than down, plus a little randomness. */
function rawTurn(column: number, row: number, random: RandomSource): number {
  const across = (column + 0.5) / SNAP_COLUMNS;
  const down = ((row + 0.5) / SNAP_ROWS) * DOWN_WEIGHT;
  const distance = Math.hypot(across, down) / Math.hypot(1, DOWN_WEIGHT);
  return distance * (1 - SNAP_JITTER) + random() * SNAP_JITTER;
}

/**
 * When each block vanishes, from 0 (first) to 1 (last), by row then
 * column. Blocks go in the order of their place along the front, but
 * spaced evenly: a curved front crosses only a few blocks near the
 * corners, so timing by distance alone would crawl at the end and look
 * stuck. By rank, every step takes the same number of blocks.
 */
export function snapOrder(random: RandomSource): number[][] {
  const blocks: { column: number; row: number; raw: number }[] = [];
  for (let row = 0; row < SNAP_ROWS; row += 1) {
    for (let column = 0; column < SNAP_COLUMNS; column += 1) {
      blocks.push({ column, row, raw: rawTurn(column, row, random) });
    }
  }
  const turns = Array.from({ length: SNAP_ROWS }, () => new Array<number>(SNAP_COLUMNS).fill(0));
  // Turns run from just above 0 to exactly 1, so the first step shows every block and the last none.
  [...blocks]
    .sort((a, b) => a.raw - b.raw)
    .forEach((block, rank) => {
      const row = turns[block.row];
      if (row !== undefined) row[block.column] = (rank + 1) / blocks.length;
    });
  return turns;
}

/** A run of neighbouring blocks still showing in one row, in blocks. */
export interface BlockRun {
  column: number;
  row: number;
  width: number;
}

/** The blocks still showing in one row, as runs of neighbours. */
function rowRuns(rowTurns: number[], row: number, shownAfter: number): BlockRun[] {
  const runs: BlockRun[] = [];
  let runStart = -1;
  rowTurns.forEach((turn, column) => {
    const isShown = turn > shownAfter;
    if (isShown && runStart === -1) runStart = column;
    const isRunOver = runStart !== -1 && (!isShown || column === rowTurns.length - 1);
    if (!isRunOver) return;
    const runEnd = isShown ? column + 1 : column;
    runs.push({ column: runStart, row, width: runEnd - runStart });
    runStart = -1;
  });
  return runs;
}

/** Each step's blocks still showing, first (all of them) to last (none). */
export function snapFrames(turns: number[][]): BlockRun[][] {
  const frames: BlockRun[][] = [];
  for (let frame = 0; frame <= SNAP_FRAMES; frame += 1) {
    const shownAfter = frame / SNAP_FRAMES;
    frames.push(turns.flatMap((rowTurns, row) => rowRuns(rowTurns, row, shownAfter)));
  }
  return frames;
}

/** Rounds to hundredths of a pixel, to keep the paths short. */
const px = (value: number): number => Math.round(value * 100) / 100;

/**
 * One step as a CSS clip path over a card of the given size in pixels: a
 * rectangle per run. With nothing left, a single point clips everything.
 */
export function toClipPath(runs: readonly BlockRun[], width: number, height: number): string {
  if (runs.length === 0) return 'path("M0 0")';
  const blockWidth = width / SNAP_COLUMNS;
  const blockHeight = height / SNAP_ROWS;
  const rectangles = runs.map(({ column, row, width: blocks }) => {
    const left = px(column * blockWidth);
    const runWidth = px(blocks * blockWidth);
    return `M${left} ${px(row * blockHeight)}h${runWidth}v${px(blockHeight)}h${-runWidth}z`;
  });
  return `path("${rectangles.join('')}")`;
}
