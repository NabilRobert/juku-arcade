/**
 * Laying out a hand: the player picks a reading card for each word card,
 * in any order, then plays the hand. Each laid reading is then thrown at
 * the word above it, left to right (useHand drives that; taps.ts scores
 * each throw). Until then nothing is checked, so the player can take a
 * card back or move it while they think. Dragging a card onto a word card
 * instead throws it at once (clearForThrow frees its place in the hand).
 *
 * A hand says which reading card is laid for each word card, by the word's
 * position in the set: hand[0] is the reading laid for the first word card.
 */
import type { RunState } from './run.ts';

export type Hand = readonly (number | null)[];

/** A laid reading and the word it will be thrown at. */
export interface PlayedPair {
  readingIndex: number;
  wordId: string;
}

export function emptyHand(state: RunState): Hand {
  return state.set.words.map(() => null);
}

function isWordMatched(state: RunState, position: number): boolean {
  const wordId = state.set.words[position]?.id;
  return wordId !== undefined && state.matchedWordIds.includes(wordId);
}

/** True once the word a reading card belongs to is matched (the decoy never is). */
export function isReadingMatched(state: RunState, readingIndex: number): boolean {
  const wordId = state.set.readings[readingIndex]?.wordId ?? null;
  return wordId !== null && state.matchedWordIds.includes(wordId);
}

/** The first word card still waiting for a reading, from the left. */
function firstOpenPosition(state: RunState, hand: Hand): number | null {
  const position = hand.findIndex(
    (readingIndex, index) => readingIndex === null && !isWordMatched(state, index),
  );
  return position === -1 ? null : position;
}

/** The word position a reading card is laid for, or null while it isn't laid. */
export function positionOf(hand: Hand, readingIndex: number): number | null {
  const position = hand.indexOf(readingIndex);
  return position === -1 ? null : position;
}

export function takeBack(hand: Hand, readingIndex: number): Hand {
  return hand.map((laid) => (laid === readingIndex ? null : laid));
}

/**
 * Before a dragged card is thrown straight at a word card: it leaves the
 * hand if it was laid, and a card laid for that word goes back down.
 */
export function clearForThrow(hand: Hand, readingIndex: number, position: number): Hand {
  return takeBack(hand, readingIndex).map((laid, index) => (index === position ? null : laid));
}

/**
 * Lays a reading card for a word card: the one given (where it was
 * dropped), or else the first one still open. A card already laid for it
 * goes back down into the hand; a card laid for another word moves.
 */
export function layReading(
  state: RunState,
  hand: Hand,
  readingIndex: number,
  position: number | null = firstOpenPosition(state, hand),
): Hand {
  if (position === null || isWordMatched(state, position)) return hand;
  if (isReadingMatched(state, readingIndex)) return hand;
  const moved = takeBack(hand, readingIndex);
  return moved.map((laid, index) => (index === position ? readingIndex : laid));
}

/** Ready to play once every word card still standing has a reading laid for it. */
export function isHandReady(state: RunState, hand: Hand): boolean {
  return firstOpenPosition(state, hand) === null && hand.some((laid) => laid !== null);
}

/** The throws a played hand makes, left to right. */
export function playOrder(state: RunState, hand: Hand): PlayedPair[] {
  const pairs: PlayedPair[] = [];
  hand.forEach((readingIndex, position) => {
    const wordId = state.set.words[position]?.id;
    if (readingIndex === null || wordId === undefined || isWordMatched(state, position)) return;
    pairs.push({ readingIndex, wordId });
  });
  return pairs;
}
