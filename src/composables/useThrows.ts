/**
 * Throwing reading cards at word cards, for the board, from the slots
 * (useTableSlots.ts). This:
 *
 * - finds the word card a dragged card is over, to light it up;
 * - finds the word card a released card was dropped on or flung at
 *   (throw-geometry.ts);
 * - when a word is matched, measures how far its reading card must fly to
 *   land on it (PlayCard draws the flight). This runs before the board
 *   redraws, so the flight starts from wherever the card is.
 */
import { reactive, ref, watch } from 'vue';
import type { RunState } from '../game/run.ts';
import {
  aimedWord,
  centreOffset,
  wordUnder,
  type Box,
  type Offset,
  type Point,
} from '../components/throw-geometry.ts';
import { boxOf, type Slots } from './useTableSlots.ts';

/** A drag reports page coordinates; boxes are in window coordinates. */
function toWindow(point: Point): Point {
  return { x: point.x - window.scrollX, y: point.y - window.scrollY };
}

/** Each word card still standing, as a box a card can be aimed at. */
function targetBoxes(state: RunState, slots: Slots): Map<string, Box> {
  const boxes = new Map<string, Box>();
  state.set.words.forEach((word, position) => {
    const wordBox = boxOf(slots.words.get(position));
    if (wordBox !== null && !state.matchedWordIds.includes(word.id)) boxes.set(word.id, wordBox);
  });
  return boxes;
}

/** The offset each newly matched word's reading card must fly, by its index in the set. */
function watchMatches(state: () => RunState, slots: Slots): Map<number, Offset> {
  const throws = reactive(new Map<number, Offset>());
  function measureThrow(wordId: string): void {
    const readingIndex = state().set.readings.findIndex((card) => card.wordId === wordId);
    const position = state().set.words.findIndex((word) => word.id === wordId);
    const from = boxOf(slots.readings.get(readingIndex));
    const to = boxOf(slots.words.get(position));
    if (from === null || to === null) return;
    throws.set(readingIndex, centreOffset(from, to));
  }
  // The default 'pre' flush runs before the board redraws.
  watch(
    () => state().matchedWordIds,
    (matched, before) => {
      if (matched.length < before.length) throws.clear();
      for (const wordId of matched) {
        if (!before.includes(wordId)) measureThrow(wordId);
      }
    },
  );
  return throws;
}

export function useThrows(state: () => RunState, slots: Slots) {
  const throws = watchMatches(state, slots);
  /** The word card a dragged card is over right now. */
  const targetWordId = ref<string | null>(null);

  return {
    throws,
    targetWordId,
    /** While dragging: light up the word card under the pointer. */
    trackDrag: (point: Point) => {
      targetWordId.value = wordUnder(toWindow(point), targetBoxes(state(), slots));
    },
    /** On release: the word card the card is aimed at, or null when it hits none. */
    release: (point: Point, velocity: Point): string | null => {
      targetWordId.value = null;
      return aimedWord(toWindow(point), velocity, targetBoxes(state(), slots));
    },
  };
}
