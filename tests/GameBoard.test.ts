import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GameBoard from '../src/components/GameBoard.vue';
import { tapCard } from '../src/game/taps.ts';
import { decoyIndex, start, START_MS, wordIdAt } from './helpers/run.ts';

describe('GameBoard', () => {
  it('shows 5 word cards with their tags over 6 reading cards', () => {
    const { state, context } = start();
    const board = mount(GameBoard, { props: { state, nowMs: START_MS, tags: context.tags } });
    const wordRow = board.find('[data-testid="word-row"]');
    expect(wordRow.findAll('button')).toHaveLength(5);
    expect(wordRow.text()).toMatch(/\+0\.\d×/);
    expect(board.find('[data-testid="reading-row"]').findAll('button')).toHaveLength(6);
  });

  it('emits the tapped card', async () => {
    const { state, context } = start();
    const board = mount(GameBoard, { props: { state, nowMs: START_MS, tags: context.tags } });
    await board.find('[data-testid="word-row"] button').trigger('click');
    expect(board.emitted('tap')?.[0]).toEqual([{ kind: 'word', wordId: wordIdAt(state, 0) }]);
  });

  it('marks a wrong pair with ✗ and the right reading with ✓', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const selected = tapCard(state, context, { kind: 'word', wordId: word }, START_MS);
    const missed = tapCard(
      selected,
      context,
      { kind: 'reading', index: decoyIndex(state) },
      START_MS,
    );
    const board = mount(GameBoard, {
      props: { state: missed, nowMs: START_MS, tags: context.tags },
    });
    expect(board.text()).toContain('✗');
    expect(board.find('[data-testid="reading-row"]').text()).toContain('✓');
  });

  it("shows each word's reading when the set times out", () => {
    const { state, context } = start();
    const timedOut = { ...state, phase: 'timedOut' as const };
    const board = mount(GameBoard, {
      props: { state: timedOut, nowMs: START_MS, tags: context.tags },
    });
    expect(board.find('[data-testid="word-row"]').text()).toContain(state.set.words[0]?.reading);
  });
});
