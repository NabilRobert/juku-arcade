/**
 * Dealing from the deck: where each card starts before it's dealt, so a new
 * set comes off the deck one card after another (card-motion.ts staggers
 * them). Measured from the slots (useTableSlots.ts); null until the board
 * is on the page, and the board waits for it before drawing cards. On a
 * phone the deck is hidden, and each card slides up from under the screen
 * instead (playtest decision, 2026-11-26).
 */
import { computed, type Ref } from 'vue';
import { placementBetween, type Box, type Placement } from '../components/cards/throw-geometry.ts';
import { boxOf, type Slots } from './useTableSlots.ts';

export interface DealFrom {
  /** By word position. */
  words: (Placement | undefined)[];
  /** By reading index. */
  readings: (Placement | undefined)[];
}

/** Just under the bottom of the screen, straight below the slot, the same size. */
export function belowScreen(slot: Box, screenHeight: number): Box {
  return { ...slot, top: screenHeight };
}

/** A hidden deck (display: none, on a phone) measures nothing. */
const isShown = (box: Box | null): box is Box => box !== null && box.width > 0;

function fromDeck(slots: Map<number, Element>, deck: Element | null): (Placement | undefined)[] {
  const deckBox = boxOf(deck);
  const placements: (Placement | undefined)[] = [];
  for (const [key, slot] of slots) {
    const slotBox = boxOf(slot);
    if (slotBox === null) continue;
    const from = isShown(deckBox) ? deckBox : belowScreen(slotBox, window.innerHeight);
    placements[key] = placementBetween(slotBox, from);
  }
  return placements;
}

export function useDeal(slots: Slots, isMounted: Ref<boolean>, layoutVersion: Ref<number>) {
  return computed<DealFrom | null>(() => {
    if (!isMounted.value) return null;
    void layoutVersion.value; // measure again after a resize
    return {
      words: fromDeck(slots.words, slots.deck),
      readings: fromDeck(slots.readings, slots.deck),
    };
  });
}
