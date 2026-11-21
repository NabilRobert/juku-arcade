/**
 * Where each matched reading card is thrown: from its own place on the
 * board to the centre of its word card, which it then knocks down
 * (PlayCard draws the flight). The board registers every card's element;
 * when a word is matched, this measures both cards before the board
 * redraws, so the thrown card knows how far to fly.
 */
import { reactive, watch, type ComponentPublicInstance } from 'vue';
import type { RunState } from '../game/run.ts';

export interface Offset {
  x: number;
  y: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** How far the centre of one box is from the centre of another, in pixels. */
export function centreOffset(from: Box, to: Box): Offset {
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
  };
}

type CardRef = Element | ComponentPublicInstance | null;

/** A template ref may be a component; its root element is the card. */
function elementOf(ref: CardRef): Element | null {
  if (ref === null) return null;
  return ref instanceof Element ? ref : (ref.$el as Element);
}

export function useThrows(state: () => RunState) {
  const wordElements = new Map<string, Element>();
  const readingElements = new Map<number, Element>();
  /** The offset each thrown reading card flies, by its index in the set. */
  const throws = reactive(new Map<number, Offset>());

  function measureThrow(wordId: string): void {
    const readingIndex = state().set.readings.findIndex((card) => card.wordId === wordId);
    const from = readingElements.get(readingIndex);
    const to = wordElements.get(wordId);
    if (from === undefined || to === undefined) return;
    throws.set(
      readingIndex,
      centreOffset(from.getBoundingClientRect(), to.getBoundingClientRect()),
    );
  }

  // The default 'pre' flush runs before the board redraws, so the cards are still in place.
  watch(
    () => state().matchedWordIds,
    (matched, before) => {
      if (matched.length < before.length) throws.clear();
      for (const wordId of matched) {
        if (!before.includes(wordId)) measureThrow(wordId);
      }
    },
  );

  return {
    throws,
    registerWord: (wordId: string) => (ref: CardRef) => {
      const element = elementOf(ref);
      if (element === null) wordElements.delete(wordId);
      else wordElements.set(wordId, element);
    },
    registerReading: (index: number) => (ref: CardRef) => {
      const element = elementOf(ref);
      if (element === null) readingElements.delete(index);
      else readingElements.set(index, element);
    },
  };
}
