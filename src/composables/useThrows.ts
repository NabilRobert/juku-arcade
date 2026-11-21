/**
 * Throwing reading cards at word cards, for the board. The board registers
 * each card's slot (the grid cell around the card, which never moves, so
 * a card being dragged doesn't change it). From the slots this:
 *
 * - finds the word card under a dragged card, to light it up;
 * - finds the word card a released card is aimed at (throw-geometry.ts);
 * - when a word is matched, measures how far its reading card must fly to
 *   land on it (PlayCard draws the flight). This runs before the board
 *   redraws, so a tapped pair is thrown the same way as a dragged one.
 */
import { reactive, ref, watch, type ComponentPublicInstance } from 'vue';
import type { RunState } from '../game/run.ts';
import {
  aimedWord,
  centreOffset,
  wordUnder,
  type Box,
  type Offset,
  type Point,
} from '../components/throw-geometry.ts';

/** What Vue hands a template ref: the slot element, or null when it's removed. */
type SlotRef = Element | ComponentPublicInstance | null;

/** A drag reports page coordinates; boxes are in window coordinates. */
function toWindow(point: Point): Point {
  return { x: point.x - window.scrollX, y: point.y - window.scrollY };
}

function register<Key>(slots: Map<Key, Element>, key: Key) {
  return (element: SlotRef) => {
    if (element instanceof Element) slots.set(key, element);
    else slots.delete(key);
  };
}

interface Slots {
  words: Map<string, Element>;
  readings: Map<number, Element>;
}

function wordBoxes(slots: Slots): Map<string, Box> {
  const boxes = new Map<string, Box>();
  for (const [wordId, slot] of slots.words) boxes.set(wordId, slot.getBoundingClientRect());
  return boxes;
}

/** The offset each newly matched word's reading card must fly, by its index in the set. */
function watchMatches(state: () => RunState, slots: Slots): Map<number, Offset> {
  const throws = reactive(new Map<number, Offset>());
  function measureThrow(wordId: string): void {
    const readingIndex = state().set.readings.findIndex((card) => card.wordId === wordId);
    const from = slots.readings.get(readingIndex);
    const to = slots.words.get(wordId);
    if (from === undefined || to === undefined) return;
    throws.set(
      readingIndex,
      centreOffset(from.getBoundingClientRect(), to.getBoundingClientRect()),
    );
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

export function useThrows(state: () => RunState) {
  const slots: Slots = { words: new Map(), readings: new Map() };
  const throws = watchMatches(state, slots);
  /** The word card a dragged card is over right now. */
  const targetWordId = ref<string | null>(null);

  return {
    throws,
    targetWordId,
    registerWord: (wordId: string) => register(slots.words, wordId),
    registerReading: (index: number) => register(slots.readings, index),
    /** While dragging: light up the word card under the pointer. */
    trackDrag: (point: Point) => {
      targetWordId.value = wordUnder(toWindow(point), wordBoxes(slots));
    },
    /** On release: the word card the throw is aimed at, or null for a miss. */
    release: (point: Point, velocity: Point): string | null => {
      targetWordId.value = null;
      return aimedWord(toWindow(point), velocity, wordBoxes(slots));
    },
  };
}
