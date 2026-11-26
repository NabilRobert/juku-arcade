// When a word set's time runs out, the cards the player laid are played, not lost (playtest, 2026-11-26).
import 'fake-indexeddb/auto';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { useRun } from '../src/composables/useRun.ts';
import { isOutOfTime, type RunState } from '../src/game/run.ts';
import type { Settings } from '../src/memory/storage.ts';
import { mountBoard } from './helpers/board.ts';
import { deckWord } from './helpers/fixtures.ts';
import { readingIndexOf, start, START_MS, wordIdAt } from './helpers/run.ts';

const SETTINGS: Settings = {
  playerId: 'p',
  level: 'N5',
  classCode: null,
  bestCombo: 0,
  playDay: null,
  playMsToday: 0,
  checkUpOfferedDay: null,
};
const KANA = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ'];
const WORDS = KANA.map((kana, index) => deckWord(`w${index}`, `語${index}`, kana));

type Board = Awaited<ReturnType<typeof mountBoard>>;
const readingCards = (board: Board) =>
  board.findAllComponents(PlayCard).filter((card) => card.props('kind') === 'reading');
const layFor = async (board: Board, state: RunState, positions: number[]): Promise<void> => {
  for (const position of positions) {
    await readingCards(board)[readingIndexOf(state, wordIdAt(state, position))]?.trigger('click');
  }
};
const playLaidCards = (board: Board): void =>
  (board.vm as unknown as { playLaidCards: () => void }).playLaidCards();

afterEach(() => vi.useRealTimers());

describe('the cards laid when time runs out', () => {
  it('throws the rest of a hand already playing, all at once', async () => {
    vi.useFakeTimers();
    const { state } = start();
    const board = await mountBoard(state);
    await layFor(board, state, [0, 1, 2, 3, 4]);
    await board.find('[data-testid="play"]').trigger('click');
    vi.advanceTimersByTime(0);
    expect(board.emitted('throw')).toHaveLength(1);
    playLaidCards(board);
    expect(board.emitted('throw')).toHaveLength(state.set.words.length);
  });

  it('throws cards laid but not yet played, and nothing for the words left open', async () => {
    const { state } = start();
    const board = await mountBoard(state);
    await layFor(board, state, [0, 1]);
    playLaidCards(board);
    const first = wordIdAt(state, 0);
    expect(board.emitted('throw')).toHaveLength(2);
    expect(board.emitted('throw')?.[0]).toEqual([readingIndexOf(state, first), first]);
  });

  it('is asked for before the set ends, while it is still in play', () => {
    vi.useFakeTimers();
    const phases: string[] = [];
    let run!: ReturnType<typeof useRun>;
    mount(
      defineComponent({
        setup() {
          run = useRun({
            words: WORDS,
            settings: SETTINGS,
            pastEvents: [],
            beforeTimeUp: () => phases.push(run.state.value.phase),
          });
          return () => h('div');
        },
      }),
    );
    vi.advanceTimersByTime(run.state.value.setDurationMs + 200);
    expect(phases).toEqual(['playing']);
    expect(run.state.value.phase).toBe('timedOut');
  });
});

describe('running out of time', () => {
  it('counts only a set in play and not paused', () => {
    const { state } = start();
    const late = state.setShownAtMs + state.setDurationMs;
    expect(isOutOfTime(state, late - 1)).toBe(false);
    expect(isOutOfTime(state, late)).toBe(true);
    expect(isOutOfTime({ ...state, pausedAtMs: START_MS }, late)).toBe(false);
  });
});
