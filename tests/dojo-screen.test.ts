// The dojo on screen: closed until enough is learned, answering, no timer, and game over.
import 'fake-indexeddb/auto';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { THROW_S } from '../src/components/cards/card-motion.ts';
import CardQuestionView from '../src/components/dojo/CardQuestionView.vue';
import DojoGame from '../src/components/dojo/DojoGame.vue';
import DojoScreen from '../src/components/dojo/DojoScreen.vue';
import LanternRow from '../src/components/dojo/LanternRow.vue';
import type { Deck } from '../src/deck/types.ts';
import { dojoPools } from '../src/dojo/dojo-questions.ts';
import { QUOTES, REST_QUOTES } from '../src/dojo/quotes.ts';
import { kanjiPool } from '../src/kanji/kanji-round.ts';
import { deleteAllData, type Settings } from '../src/memory/storage.ts';
import { playSound } from '../src/sound/sfx.ts';
import { answer } from './helpers/events.ts';
import { deckWord } from './helpers/fixtures.ts';

vi.mock('../src/sound/sfx.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/sound/sfx.ts')>()),
  playSound: vi.fn(),
}));

const DECK: Deck = {
  level: 'N5',
  sourceCommit: 'test',
  kanji: {},
  words: Array.from({ length: 12 }, (_, index) =>
    deckWord(`w${index}`, `語${index}`, `ご${index}`),
  ),
};
const SETTINGS: Settings = {
  playerId: 'p',
  level: 'N5',
  classCode: null,
  bestCombo: 0,
  playDay: null,
  playMsToday: 0,
  checkUpOfferedDay: null,
};
// Every word matched once: words are the only kind the dojo can ask.
const POOLS = dojoPools(DECK.words, kanjiPool(DECK), {
  wordEvents: DECK.words.map((word) => answer(word.id, '2026-11-26', 'clean')),
  kanjiRounds: [],
  grammarEvents: [],
});

const mountGame = () =>
  mount(DojoGame, { props: { pools: POOLS, level: 'N5', settings: SETTINGS, isAway: false } });

/** Picks a right or a wrong reading card on the question's board, plays it, and lets it land. */
async function choose(game: ReturnType<typeof mountGame>, isRight: boolean): Promise<void> {
  // The board deals its cards once it's on the page.
  await nextTick();
  const board = game.findComponent(CardQuestionView);
  const index = board.props('round').cards.findIndex((card) => card.isRight === isRight);
  const readings = board
    .findAllComponents(PlayCard)
    .filter((card) => card.props('kind') === 'reading');
  readings[index]?.vm.$emit('tap');
  await nextTick();
  await board.find('[data-testid="play"]').trigger('click');
  await vi.advanceTimersByTimeAsync(THROW_S * 1000 + 50);
}

afterEach(() => {
  vi.useRealTimers();
});

describe('the dojo on screen', () => {
  it('stays closed until enough words have been matched, and says what to play', async () => {
    await deleteAllData();
    const screen = mount(DojoScreen, { props: { deck: DECK, settings: SETTINGS, isAway: false } });
    await flushPromises();
    expect(screen.find('[data-testid="dojo-closed"]').text()).toContain('Match 10 words');
  });

  it('scores a right answer and keeps every lantern lit', async () => {
    vi.useFakeTimers();
    const game = mountGame();
    await choose(game, true);
    expect(game.find('[data-testid="score"]').text()).toBe('1');
    expect(game.findComponent(LanternRow).props('lit')).toBe(3);
  });

  it('applauds each right answer with a short burst, and a miss with none', async () => {
    vi.useFakeTimers();
    vi.mocked(playSound).mockClear();
    const game = mountGame();
    await choose(game, false);
    expect(playSound).not.toHaveBeenCalledWith('applauseShort');
    await vi.advanceTimersByTimeAsync(2500);
    await choose(game, true);
    expect(playSound).toHaveBeenCalledWith('applauseShort');
  });

  it('ends the run after three misses, with the results', async () => {
    vi.useFakeTimers();
    const game = mountGame();
    for (let miss = 0; miss < 3; miss += 1) {
      await choose(game, false);
      await vi.advanceTimersByTimeAsync(2500);
    }
    expect(game.find('[data-testid="results"]').text()).toContain('Game over');
    expect(game.findComponent(LanternRow).props('lit')).toBe(0);
  });

  it('recaps the score and best combo with a quote, then restarts or quits', async () => {
    await deleteAllData();
    vi.useFakeTimers();
    const game = mountGame();
    for (const isRight of [true, true, false, true, false, false]) {
      await choose(game, isRight);
      await vi.advanceTimersByTimeAsync(2500);
    }
    const results = game.find('[data-testid="results"]');
    expect(results.find('[data-testid="result-Your score was"]').text()).toBe('3');
    expect(results.find('[data-testid="result-Your best combo was"]').text()).toBe('2');
    expect(results.find('[data-testid="quote"]').text()).toMatch(/― .+, .+/);
    // No earlier run in this browser: the first best is greeted.
    expect(results.find('[data-testid="best-comparison"]').text()).toContain('Your first best');
    await results.find('[data-testid="play-again"]').trigger('click');
    await results.find('[data-testid="leave"]').trigger('click');
    expect([game.emitted('again'), game.emitted('leave')]).toEqual([[[]], [[]]]);
    expect(results.text()).toContain('Restart');
    expect(results.text()).toContain('Quit to main menu');
  });

  it('waits as long as the player needs: a question left alone puts out no lantern', async () => {
    vi.useFakeTimers();
    const game = mountGame();
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(game.findComponent(LanternRow).props('lit')).toBe(3);
    expect(game.find('[data-testid="timer"]').exists()).toBe(false);
  });

  it('hides the question while paused', async () => {
    vi.useFakeTimers();
    const game = mountGame();
    await game
      .findAll('button')
      .find((button) => button.text().includes('Pause'))
      ?.trigger('click');
    expect(game.find('[data-testid="dojo-paused"]').exists()).toBe(true);
    expect(game.findComponent(CardQuestionView).exists()).toBe(false);
  });
});

describe('the lanterns', () => {
  it('light the lives left and dim the rest', () => {
    const row = mount(LanternRow, { props: { lit: 2, total: 3 } });
    const lit = row.findAll('svg').map((lantern) => lantern.attributes('data-lit'));
    expect(lit).toEqual(['true', 'true', 'false']);
    expect(row.attributes('aria-label')).toBe('2 of 3 lanterns lit');
  });
});

describe('the game-over and resting quotes', () => {
  it('each name who said it and where, so it can be checked', () => {
    for (const quote of [...QUOTES, ...REST_QUOTES]) {
      expect(quote.text.length).toBeGreaterThan(0);
      expect(quote.by.length).toBeGreaterThan(0);
      expect(quote.source.length).toBeGreaterThan(0);
    }
  });
});
