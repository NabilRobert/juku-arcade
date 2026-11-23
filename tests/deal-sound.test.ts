// Dealing a set: each card leaves the deck in turn, left to right and top row first, with its own sound.
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { dealDelayMs } from '../src/components/cards/card-motion.ts';
import { hoverPitch, playSound } from '../src/sound/sfx.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

describe('dealing a set', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(playSound).mockClear();
  });

  it('deals each card a clear step after the one before, in board order', () => {
    expect(dealDelayMs(0)).toBe(0);
    expect(dealDelayMs(1)).toBeGreaterThanOrEqual(100);
    expect(dealDelayMs(6) - dealDelayMs(5)).toBe(dealDelayMs(1));
  });

  it('taps each card down as it comes off the deck, a little higher each turn, not before', () => {
    mount(PlayCard, {
      props: { text: 'ほん', kind: 'reading', status: 'idle', index: 3, level: 'N5' },
    });
    vi.advanceTimersByTime(dealDelayMs(3) - 1);
    expect(playSound).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(playSound).toHaveBeenCalledWith('deal', hoverPitch(3));
  });

  it("starts each row's rise afresh: the first reading card taps like the first word card", () => {
    mount(PlayCard, {
      props: { text: 'ほん', kind: 'reading', status: 'idle', index: 5, rowPlace: 0, level: 'N5' },
    });
    vi.advanceTimersByTime(dealDelayMs(5));
    expect(playSound).toHaveBeenCalledWith('deal', hoverPitch(0));
  });
});
