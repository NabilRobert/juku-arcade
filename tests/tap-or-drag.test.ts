// Telling a click from a drag: a wobbling click still lays a card; a real drag doesn't also tap.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { isDrag, TAP_SLOP_PX } from '../src/components/cards/throw-geometry.ts';
import { mountBoard } from './helpers/board.ts';
import { start } from './helpers/run.ts';

const READING = { text: 'ほん', kind: 'reading', status: 'idle', index: 0, level: 'N5' } as const;
const ORIGIN = { x: 0, y: 0 };

function pressAndClick(moveX: number, detail = 1) {
  const card = mount(PlayCard, { props: READING });
  void card.trigger('pointerdown', { clientX: 100, clientY: 100 });
  void card.trigger('click', { clientX: 100 + moveX, clientY: 100, detail });
  return card;
}

describe('a click or a drag', () => {
  it('counts a press that moves less than the slop as a click', () => {
    expect(isDrag(ORIGIN, { x: TAP_SLOP_PX - 1, y: 0 })).toBe(false);
    expect(isDrag(ORIGIN, { x: TAP_SLOP_PX, y: 0 })).toBe(true);
  });

  it('taps a card clicked with a small wobble', () => {
    expect(pressAndClick(4).emitted('tap')).toHaveLength(1);
  });

  it("doesn't tap a card that was dragged away and back", () => {
    expect(pressAndClick(40).emitted('tap')).toBeUndefined();
  });

  it('always taps on a keyboard click', () => {
    expect(pressAndClick(40, 0).emitted('tap')).toHaveLength(1);
  });
});

describe('a laid reading on the board', () => {
  it('marks the word card it is laid for with its number and the reading', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    const reading = board
      .findAllComponents(PlayCard)
      .find((card) => card.props('kind') === 'reading');
    reading?.vm.$emit('tap');
    await board.vm.$nextTick();
    expect(board.find('[data-testid="queued-tag"]').text()).toBe('1');
    expect(board.find('[data-testid="word-label-1"]').text()).toContain(reading?.props('text'));
    expect(board.find('[data-testid="word-label-2"]').text()).toBe('2');
  });
});
