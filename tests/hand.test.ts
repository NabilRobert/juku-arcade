// Laying out a hand: a reading under each word card, then playing them left to right.
import { describe, expect, it } from 'vitest';
import {
  emptyHand,
  isHandReady,
  layReading,
  playOrder,
  positionOf,
  takeBack,
} from '../src/game/hand.ts';
import { readingIndexOf, start, wordIdAt } from './helpers/run.ts';

describe('laying out a hand', () => {
  it('lays each clicked reading under the next open word card, from the left', () => {
    const { state } = start();
    const once = layReading(state, emptyHand(state), 3);
    const twice = layReading(state, once, 1);
    expect(positionOf(twice, 3)).toBe(0);
    expect(positionOf(twice, 1)).toBe(1);
  });

  it('moves a card dropped on another word card, and sends the card lying there back', () => {
    const { state } = start();
    const laid = layReading(state, layReading(state, emptyHand(state), 0), 1);
    const moved = layReading(state, laid, 1, 0);
    expect(positionOf(moved, 1)).toBe(0);
    expect(positionOf(moved, 0)).toBeNull();
  });

  it('skips word cards already knocked down', () => {
    const { state } = start();
    const oneDown = { ...state, matchedWordIds: [wordIdAt(state, 0)] };
    expect(positionOf(layReading(oneDown, emptyHand(oneDown), 5), 5)).toBe(1);
  });

  it('is ready to play once every standing word card has a reading', () => {
    const { state } = start();
    let hand = emptyHand(state);
    for (let index = 0; index < state.set.words.length; index += 1) {
      expect(isHandReady(state, hand)).toBe(false);
      hand = layReading(state, hand, index);
    }
    expect(isHandReady(state, hand)).toBe(true);
    expect(isHandReady(state, takeBack(hand, 2))).toBe(false);
  });

  it('plays each laid reading at the word card above it, left to right', () => {
    const { state } = start();
    const first = wordIdAt(state, 0);
    const second = wordIdAt(state, 1);
    const hand = layReading(
      state,
      layReading(state, emptyHand(state), readingIndexOf(state, first)),
      readingIndexOf(state, second),
    );
    expect(playOrder(state, hand)).toEqual([
      { readingIndex: readingIndexOf(state, first), wordId: first },
      { readingIndex: readingIndexOf(state, second), wordId: second },
    ]);
  });
});
