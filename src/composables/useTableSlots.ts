/**
 * Where everything sits on the table, for the board's moving cards. The
 * board registers each slot: the place of each word card, each reading
 * card's place in the player's hand, and the deck. Slots never move (a
 * dragged card moves inside its slot), so their boxes say where a card
 * should fly. Words are kept by position, so the slots stay put from one
 * set to the next.
 *
 * `layoutVersion` changes when the window is resized, so anything measured
 * from the slots is measured again.
 */
import { onMounted, onUnmounted, ref, type ComponentPublicInstance } from 'vue';
import type { Box } from '../components/throw-geometry.ts';

/** What Vue hands a template ref: the slot element, or null when it's removed. */
type SlotRef = Element | ComponentPublicInstance | null;

export interface Slots {
  words: Map<number, Element>;
  readings: Map<number, Element>;
  deck: Element | null;
}

function register<Key>(slots: Map<Key, Element>, key: Key) {
  return (element: SlotRef) => {
    if (element instanceof Element) slots.set(key, element);
    else slots.delete(key);
  };
}

export function boxOf(element: Element | null | undefined): Box | null {
  return element ? element.getBoundingClientRect() : null;
}

export function useTableSlots() {
  const slots: Slots = { words: new Map(), readings: new Map(), deck: null };
  /** True once the slots are on the page and can be measured. */
  const isMounted = ref(false);
  const layoutVersion = ref(0);
  const remeasure = (): void => {
    layoutVersion.value += 1;
  };
  onMounted(() => {
    isMounted.value = true;
    window.addEventListener('resize', remeasure);
  });
  onUnmounted(() => window.removeEventListener('resize', remeasure));

  return {
    slots,
    isMounted,
    layoutVersion,
    registerWord: (position: number) => register(slots.words, position),
    registerReading: (index: number) => register(slots.readings, index),
    registerDeck: (element: SlotRef) => {
      slots.deck = element instanceof Element ? element : null;
    },
  };
}
