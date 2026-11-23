// Hovering a card: a soft brush, rising along the row, never a burst, and only when it means something.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { HOVER_GAP_MS, hoverPitch, playHoverSound, takeHoverTurn } from '../src/sound/sfx.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playHoverSound: vi.fn(),
}));

const CARD = { text: 'ほん', kind: 'reading', index: 3, level: 'N5' } as const;

function hover(
  status: 'idle' | 'hidden' | 'matched',
  init: PointerEventInit = {},
  kind: 'word' | 'reading' = 'reading',
) {
  const card = mount(PlayCard, { props: { ...CARD, kind, status } });
  void card.trigger('pointerenter', { pointerType: 'mouse', buttons: 0, ...init });
}

describe('the hover tick', () => {
  it('rises a little with each card along the row', () => {
    expect(hoverPitch(0)).toBe(1);
    expect(hoverPitch(5)).toBeGreaterThan(hoverPitch(4));
    expect(hoverPitch(10)).toBeLessThan(1.5);
  });

  it('plays at most once in HOVER_GAP_MS, however fast the mouse sweeps', () => {
    expect(takeHoverTurn(10_000)).toBe(true);
    expect(takeHoverTurn(10_000 + HOVER_GAP_MS - 1)).toBe(false);
    expect(takeHoverTurn(10_000 + HOVER_GAP_MS)).toBe(true);
  });
});

describe('hovering a card', () => {
  afterEach(() => vi.mocked(playHoverSound).mockClear());

  it("brushes with the card's place on the board", () => {
    hover('idle');
    expect(playHoverSound).toHaveBeenCalledWith(CARD.index);
  });

  it('stays quiet on touch, while dragging, and on matched cards', () => {
    hover('idle', { pointerType: 'touch' });
    hover('idle', { buttons: 1 });
    hover('matched', {}, 'word');
    expect(playHoverSound).not.toHaveBeenCalled();
  });

  it('brushes a face-down word card while paused, as it can be turned over to read', () => {
    hover('hidden', {}, 'word');
    expect(playHoverSound).toHaveBeenCalledOnce();
  });
});
