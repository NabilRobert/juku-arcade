// The pixel snap: blocks blink out in a front sweeping from the top-left corner, leaving nothing.
import { describe, expect, it } from 'vitest';
import {
  SNAP_COLUMNS,
  SNAP_FRAMES,
  SNAP_ROWS,
  snapFrames,
  snapOrder,
  toClipPath,
  type BlockRun,
} from '../src/components/pixel-snap.ts';
import { seededRandom } from './helpers/fixtures.ts';

/** How many blocks a step still shows: its runs' widths, added up. */
function blocksShown(runs: readonly BlockRun[]): number {
  return runs.reduce((sum, run) => sum + run.width, 0);
}

describe('the pixel snap', () => {
  const turns = snapOrder(seededRandom(4));
  const frames = snapFrames(turns);

  it('takes the top-left corner first and the bottom-right corner last', () => {
    expect(turns[0]?.[0] ?? 1).toBeLessThan(0.2);
    expect(turns[SNAP_ROWS - 1]?.[SNAP_COLUMNS - 1] ?? 0).toBeGreaterThan(0.8);
  });

  it('clears the left side before any block on the right goes', () => {
    const leftColumn = turns.map((rowTurns) => rowTurns[0] ?? 1);
    const rightColumn = turns.map((rowTurns) => rowTurns[SNAP_COLUMNS - 1] ?? 0);
    expect(Math.max(...leftColumn)).toBeLessThan(Math.min(...rightColumn));
  });

  it('starts with the whole card showing and ends with nothing left', () => {
    expect(frames).toHaveLength(SNAP_FRAMES + 1);
    expect(blocksShown(frames[0] ?? [])).toBe(SNAP_COLUMNS * SNAP_ROWS);
    expect(blocksShown(frames[SNAP_FRAMES] ?? [])).toBe(0);
  });

  it('shows exactly the blocks whose turn has not come yet in every step', () => {
    frames.forEach((runs, frame) => {
      const stillShowing = turns.flat().filter((turn) => turn > frame / SNAP_FRAMES).length;
      expect(blocksShown(runs)).toBe(stillShowing);
    });
  });

  it('draws a step as one rectangle per run, in the card’s pixels', () => {
    const path = toClipPath([{ column: 3, row: 2, width: 4 }], 300, 400);
    expect(path).toBe('path("M30 20h40v10h-40z")');
    expect(toClipPath([], 300, 400)).toBe('path("M0 0")');
  });
});
