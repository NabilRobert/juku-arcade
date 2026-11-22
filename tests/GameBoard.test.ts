import { afterEach, describe, expect, it, vi } from 'vitest';
import PlayCard from '../src/components/PlayCard.vue';
import { PLAY_STEP_MS } from '../src/composables/useHand.ts';
import { tapCard } from '../src/game/taps.ts';
import type { RunState } from '../src/game/run.ts';
import { mountBoard } from './helpers/board.ts';
import { decoyIndex, readingIndexOf, start, START_MS, wordIdAt } from './helpers/run.ts';

type Board = Awaited<ReturnType<typeof mountBoard>>;

function readingCards(board: Board) {
  return board.findAllComponents(PlayCard).filter((card) => card.props('kind') === 'reading');
}

/** Clicks each word's own reading card, so the hand is laid out right, left to right. */
async function layRightHand(board: Board, state: RunState): Promise<void> {
  for (const word of state.set.words) {
    await readingCards(board)[readingIndexOf(state, word.id)]?.trigger('click');
  }
}

describe('GameBoard', () => {
  afterEach(() => vi.useRealTimers());

  it('shows 5 word cards with their tags over 6 reading cards and the deck', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    const wordRow = board.find('[data-testid="word-row"]');
    expect(wordRow.findAll('button')).toHaveLength(5);
    expect(wordRow.text()).toMatch(/\+0\.\d×/);
    expect(board.find('[data-testid="reading-row"]').findAll('button')).toHaveLength(6);
    expect(board.find('[data-testid="deck"]').exists()).toBe(true);
  });

  it('lays a clicked reading card for the first open word card, tagged 1, and takes it back on a second click', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    const card = readingCards(board)[0];
    await card?.trigger('click');
    expect(card?.find('[data-testid="order-tag"]').text()).toBe('1');
    await card?.trigger('click');
    expect(card?.props('order')).toBeUndefined();
  });

  it('keeps Play disabled until every word card has a reading under it', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    const play = board.find('[data-testid="play"]');
    await readingCards(board)[0]?.trigger('click');
    expect(play.attributes('disabled')).toBeDefined();
    await readingCards(board)[0]?.trigger('click');
    await layRightHand(board, state);
    expect(play.attributes('disabled')).toBeUndefined();
  });

  it('plays the hand left to right, one throw at a time', async () => {
    vi.useFakeTimers();
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    await layRightHand(board, state);
    await board.find('[data-testid="play"]').trigger('click');
    vi.advanceTimersByTime(0);
    const first = wordIdAt(state, 0);
    expect(board.emitted('throw')).toEqual([[readingIndexOf(state, first), first]]);
    vi.advanceTimersByTime(PLAY_STEP_MS);
    const second = wordIdAt(state, 1);
    expect(board.emitted('throw')?.[1]).toEqual([readingIndexOf(state, second), second]);
    vi.advanceTimersByTime(PLAY_STEP_MS * state.set.words.length);
    expect(board.emitted('throw')).toHaveLength(state.set.words.length);
  });

  it('stops throwing when the game is paused mid-hand, leaving the rest laid out', async () => {
    vi.useFakeTimers();
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    await layRightHand(board, state);
    await board.find('[data-testid="play"]').trigger('click');
    vi.advanceTimersByTime(0);
    await board.setProps({ state: { ...state, pausedAtMs: START_MS } });
    vi.advanceTimersByTime(PLAY_STEP_MS * state.set.words.length);
    expect(board.emitted('throw')).toHaveLength(1);
    const lastCard = readingCards(board)[readingIndexOf(state, wordIdAt(state, 4))];
    expect(lastCard?.props('order')).toBe(5);
  });

  it('flips a word card tapped while paused, and does nothing with it otherwise', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    await board.find('[data-testid="word-row"] button').trigger('click');
    expect(board.emitted('flip')).toBeUndefined();
    await board.setProps({ state: { ...state, pausedAtMs: START_MS } });
    await board.find('[data-testid="word-row"] button').trigger('click');
    expect(board.emitted('flip')?.[0]).toEqual([state.set.words[0]]);
  });

  it('marks a wrong pair with ✗ and the right reading with ✓', async () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const selected = tapCard(state, context, { kind: 'word', wordId: word }, START_MS);
    const missed = tapCard(
      selected,
      context,
      { kind: 'reading', index: decoyIndex(state) },
      START_MS,
    );
    const board = await mountBoard(missed, context.tags);
    expect(board.text()).toContain('✗');
    expect(board.find('[data-testid="reading-row"]').text()).toContain('✓');
  });

  it("shows each word's reading when the set times out", async () => {
    const { state, context } = start();
    const board = await mountBoard({ ...state, phase: 'timedOut' }, context.tags);
    expect(board.find('[data-testid="word-row"]').text()).toContain(state.set.words[0]?.reading);
  });
});
