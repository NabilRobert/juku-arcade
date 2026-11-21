import { describe, expect, it } from 'vitest';
import { flipCard, pause, resume } from '../src/game/pause.ts';
import { nextSet, secondsLeft, timeUp, type RunState } from '../src/game/run.ts';
import { tapCard } from '../src/game/taps.ts';
import { MISSED_TRAY_SIZE } from '../src/game/tuning.ts';
import {
  decoyIndex,
  makeContext,
  readingIndexOf,
  start,
  START_MS,
  wordIdAt,
} from './helpers/run.ts';

type Context = ReturnType<typeof makeContext>;

function tapPair(
  state: RunState,
  context: Context,
  wordId: string,
  readingIndex: number,
  at: number,
): RunState {
  const selected = tapCard(state, context, { kind: 'word', wordId }, at);
  return tapCard(selected, context, { kind: 'reading', index: readingIndex }, at);
}

function wordAt(state: RunState, position: number) {
  const word = state.set.words[position];
  if (word === undefined) throw new Error(`No word at position ${position}`);
  return word;
}

describe('pause', () => {
  it('stops the clock while paused and moves it on by the pause on resume', () => {
    const { state, context } = start();
    const paused = pause(state, context, START_MS + 10_000);
    expect(secondsLeft(paused, START_MS + 60_000)).toBe(30);
    const resumed = resume(paused, context, START_MS + 60_000);
    expect(secondsLeft(resumed, START_MS + 60_000)).toBe(30);
  });

  it('never times a set out while paused', () => {
    const { state, context } = start();
    const paused = pause(state, context, START_MS + 1_000);
    expect(timeUp(paused, context, START_MS + 100_000)).toBe(paused);
  });

  it('ignores taps while paused', () => {
    const { state, context } = start();
    const paused = pause(state, context, START_MS);
    expect(tapCard(paused, context, { kind: 'word', wordId: wordIdAt(state, 0) }, START_MS)).toBe(
      paused,
    );
  });

  it('logs a pause and a resume event', () => {
    const { state, context } = start();
    const resumed = resume(pause(state, context, START_MS), context, START_MS + 500);
    expect(resumed.events.slice(-2).map((event) => event.kind)).toEqual(['pause', 'resume']);
  });
});

describe('flip and peek', () => {
  it('flips a card only while paused', () => {
    const { state, context } = start();
    expect(flipCard(state, context, wordAt(state, 0), START_MS).flippedWord).toBeNull();
    expect(
      flipCard(pause(state, context, START_MS), context, wordAt(state, 0), START_MS).flippedWord
        ?.id,
    ).toBe(wordIdAt(state, 0));
  });

  it('marks an unmatched board card as peeked and logs a peek', () => {
    const { state, context } = start();
    const flipped = flipCard(pause(state, context, START_MS), context, wordAt(state, 0), START_MS);
    expect(flipped.peekedWordIds).toEqual([wordIdAt(state, 0)]);
    expect(flipped.events.at(-1)).toMatchObject({ kind: 'peek', word_id: wordIdAt(state, 0) });
  });

  it('scores nothing for a peeked match and keeps the combo', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const peeked = resume(
      flipCard(
        pause({ ...state, combo: 6 }, context, START_MS),
        context,
        wordAt(state, 0),
        START_MS,
      ),
      context,
      START_MS,
    );
    const matched = tapPair(peeked, context, word, readingIndexOf(state, word), START_MS + 1_000);
    expect([matched.combo, matched.cleanMatchTags.length, matched.matchedWordIds.length]).toEqual([
      6, 0, 1,
    ]);
    expect(matched.events.at(-1)?.outcome).toBe('peeked');
  });

  it('flips a tray card freely, without a peek', () => {
    const { state, context } = start();
    const missed = tapPair(state, context, wordIdAt(state, 0), decoyIndex(state), START_MS);
    const trayWord = missed.missedTray[0];
    if (trayWord === undefined) throw new Error('The miss should fill the tray');
    const boardWithoutIt = missed.set.words.filter((word) => word.id !== trayWord.id);
    const paused = pause(
      { ...missed, set: { ...missed.set, words: boardWithoutIt } },
      context,
      START_MS,
    );
    const flipped = flipCard(paused, context, trayWord, START_MS);
    expect(flipped.flippedWord?.id).toBe(trayWord.id);
    expect(flipped.peekedWordIds).toEqual([]);
  });

  it('turns the card back over when it is flipped again', () => {
    const { state, context } = start();
    const paused = pause(state, context, START_MS);
    const once = flipCard(paused, context, wordAt(state, 0), START_MS);
    expect(flipCard(once, context, wordAt(state, 0), START_MS).flippedWord).toBeNull();
  });
});

describe('comebacks and the missed tray', () => {
  it('deals a missed word again in the next set', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const missed = tapPair(state, context, word, decoyIndex(state), START_MS);
    const next = nextSet({ ...missed, phase: 'cleared' }, context, START_MS);
    expect(next.set.words.map((candidate) => candidate.id)).toContain(word);
    expect(next.comebackWordIds).not.toContain(word);
  });

  it('keeps comeback words that were not dealt queued for a later set', () => {
    const { state, context } = start();
    const allIds = context.pool.map((word) => word.id);
    const next = nextSet(
      { ...state, phase: 'cleared', comebackWordIds: allIds },
      context,
      START_MS,
    );
    const dealtIds = next.set.words.map((word) => word.id);
    expect(next.comebackWordIds).toEqual(allIds.filter((id) => !dealtIds.includes(id)));
  });

  it(`keeps the newest ${MISSED_TRAY_SIZE} missed words, newest first`, () => {
    const { state, context } = start();
    const missed = tapPair(state, context, wordIdAt(state, 1), decoyIndex(state), START_MS);
    const twice = tapPair(missed, context, wordIdAt(state, 2), decoyIndex(state), START_MS);
    expect(twice.missedTray.map((word) => word.id)).toEqual([
      wordIdAt(state, 2),
      wordIdAt(state, 1),
    ]);
  });
});
