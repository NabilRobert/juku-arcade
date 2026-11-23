// Throwing a reading card at a word card: where it's aimed, and what the throw does.
import { describe, expect, it } from 'vitest';
import PlayCard from '../src/components/cards/PlayCard.vue';
import { aimedWord, type Box } from '../src/components/cards/throw-geometry.ts';
import { tapCard, throwReading } from '../src/game/taps.ts';
import {
  otherWordsReadingIndex,
  readingIndexOf,
  start,
  START_MS,
  wordIdAt,
} from './helpers/run.ts';
import { mountBoard } from './helpers/board.ts';

const CARD = { width: 120, height: 160 };
const WORDS = new Map<string, Box>([
  ['left', { left: 0, top: 0, ...CARD }],
  ['right', { left: 200, top: 0, ...CARD }],
]);
const STILL = { x: 0, y: 0 };

describe('aiming a throw', () => {
  it('aims at the word card the card was dropped on', () => {
    expect(aimedWord({ x: 250, y: 80 }, STILL, WORDS)).toBe('right');
  });

  it('aims a fling at the word card the card was heading for', () => {
    // Let go below the cards, moving up fast: 0.15 s later it is over 'left'.
    expect(aimedWord({ x: 60, y: 400 }, { x: 0, y: -2000 }, WORDS)).toBe('left');
  });

  it('misses when the card was let go away from every word card', () => {
    expect(aimedWord({ x: 160, y: 400 }, STILL, WORDS)).toBeNull();
  });
});

describe('throwing a reading card', () => {
  it('matches the pair it was thrown at, even with another word card selected', () => {
    const { state, context } = start();
    const wordId = wordIdAt(state, 0);
    const otherSelected = tapCard(
      state,
      context,
      { kind: 'word', wordId: wordIdAt(state, 1) },
      START_MS,
    );
    const thrown = throwReading(
      otherSelected,
      context,
      readingIndexOf(state, wordId),
      wordId,
      START_MS,
    );
    expect(thrown.matchedWordIds).toEqual([wordId]);
    expect(thrown.selected).toBeNull();
  });

  it('is a miss on the word card it was thrown at when the pair is wrong', () => {
    const { state, context } = start();
    const wordId = wordIdAt(state, 0);
    const thrown = throwReading(
      state,
      context,
      otherWordsReadingIndex(state, wordId),
      wordId,
      START_MS,
    );
    expect(thrown.matchedWordIds).toEqual([]);
    expect(thrown.flash?.wordId).toBe(wordId);
  });

  it('does nothing while the game is paused', () => {
    const { state, context } = start();
    const paused = { ...state, pausedAtMs: START_MS };
    const wordId = wordIdAt(state, 0);
    expect(throwReading(paused, context, readingIndexOf(state, wordId), wordId, START_MS)).toBe(
      paused,
    );
  });

  it('throws a reading card let go on a word card at that word straight away, without Play', async () => {
    const { state, context } = start();
    const board = await mountBoard(state, context.tags);
    const wordSlot = board.find('[data-testid="word-row"] > div > div').element;
    wordSlot.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, ...CARD });
    const reading = board
      .findAllComponents(PlayCard)
      .find((card) => card.props('kind') === 'reading');
    reading?.vm.$emit('release', { x: 50, y: 50 }, STILL);
    await board.vm.$nextTick();
    expect(board.emitted('throw')?.[0]).toEqual([0, wordIdAt(state, 0)]);
    expect(reading?.props('order')).toBeUndefined();
  });
});
