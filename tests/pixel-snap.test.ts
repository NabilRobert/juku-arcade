// The pixel snap: blocks blink out in a circle from the top-left corner, leaving nothing.
import { describe, expect, it } from 'vitest';
import {
  SNAP_COLUMNS,
  SNAP_FRAMES,
  SNAP_ROWS,
  snapMasks,
  snapOrder,
} from '../src/components/pixel-snap.ts';
import { seededRandom } from './helpers/fixtures.ts';

/** How many blocks a mask still shows: the widths of its rectangles (each one block tall), added up. */
function blocksShown(mask: string): number {
  const widths = [...decodeURIComponent(mask).matchAll(/h(\d+)v1H/g)].map((match) =>
    Number(match[1]),
  );
  return widths.reduce((sum, width) => sum + width, 0);
}

describe('the pixel snap', () => {
  const turns = snapOrder(seededRandom(4));

  it('takes the top-left corner first and the bottom-right corner last', () => {
    const topLeft = turns[0]?.[0] ?? 1;
    const bottomRight = turns[SNAP_ROWS - 1]?.[SNAP_COLUMNS - 1] ?? 0;
    expect(topLeft).toBeLessThan(0.4);
    expect(bottomRight).toBeGreaterThan(0.6);
  });

  it('starts with the whole card showing and ends with nothing left', () => {
    const masks = snapMasks(turns);
    expect(masks).toHaveLength(SNAP_FRAMES + 1);
    expect(blocksShown(masks[0] ?? '')).toBe(SNAP_COLUMNS * SNAP_ROWS);
    expect(blocksShown(masks[SNAP_FRAMES] ?? '')).toBe(0);
  });

  it('hides more blocks with every frame', () => {
    const shown = snapMasks(turns).map(blocksShown);
    for (let frame = 1; frame < shown.length; frame += 1) {
      expect(shown[frame]).toBeLessThanOrEqual(shown[frame - 1] ?? 0);
    }
  });

  it('shows exactly the blocks whose turn has not come yet in every frame', () => {
    snapMasks(turns).forEach((mask, frame) => {
      const stillShowing = turns.flat().filter((turn) => turn > frame / SNAP_FRAMES).length;
      expect(blocksShown(mask)).toBe(stillShowing);
    });
  });
});
