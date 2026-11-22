/**
 * Dealing from the deck: where each card starts before it's dealt, so a new
 * set comes off the deck one card after another (card-motion.ts staggers
 * them). Measured from the slots (useTableSlots.ts); null until the board
 * is on the page, and the board waits for it before drawing cards.
 */
import { computed, type Ref } from 'vue';
import { placementBetween, type Placement } from '../components/throw-geometry.ts';
import { boxOf, type Slots } from './useTableSlots.ts';

export interface DealFrom {
  /** By word position. */
  words: (Placement | undefined)[];
  /** By reading index. */
  readings: (Placement | undefined)[];
}

function fromDeck(slots: Map<number, Element>, deck: Element | null): (Placement | undefined)[] {
  const deckBox = boxOf(deck);
  const placements: (Placement | undefined)[] = [];
  for (const [key, slot] of slots) {
    const slotBox = boxOf(slot);
    placements[key] =
      deckBox === null || slotBox === null ? undefined : placementBetween(slotBox, deckBox);
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
