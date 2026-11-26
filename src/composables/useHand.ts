/**
 * The hand the player lays out (game/hand.ts), for the board: which reading
 * goes with which word card, and playing the hand. A laid card stays in
 * the player's hand, lifted, tagged with its word's number (1 to 5). Playing throws the laid cards one after another, left to
 * right, each through the same throw a dragged card makes (taps.ts), so
 * every hit lands, dissolves with its word and builds the combo in turn.
 * A wrong card springs back to the player's hand to be laid again.
 * Dragging a card onto a word card throws it at once (throwNow), without
 * laying it or pressing Play.
 */
import { computed, onUnmounted, ref, shallowRef, watch, type ShallowRef } from 'vue';
import {
  clearForThrow,
  emptyHand,
  isHandReady,
  layReading,
  playOrder,
  positionOf,
  takeBack,
  type Hand,
  type PlayedPair,
} from '../game/hand.ts';
import type { RunState } from '../game/run.ts';

/** Time between one laid card being thrown and the next: each lands as the next takes off. */
export const PLAY_STEP_MS = 450;

/** The hand can be laid out and played only while a set is in play and the game isn't paused. */
function isInPlay(state: RunState): boolean {
  return state.phase === 'playing' && state.pausedAtMs === null;
}

/** Playing a laid-out hand: throws its cards one after another, and can be stopped. */
function usePlayback(
  state: () => RunState,
  hand: ShallowRef<Hand>,
  throwCard: (pair: PlayedPair) => void,
) {
  const isPlaying = ref(false);
  let timers: ReturnType<typeof setTimeout>[] = [];

  function stop(): void {
    timers.forEach(clearTimeout);
    timers = [];
    isPlaying.value = false;
  }

  /** Throws one laid card, unless the set ended or the game paused since Play was pressed. */
  function throwNext(pair: PlayedPair, isLast: boolean): void {
    if (!isInPlay(state())) return stop();
    hand.value = takeBack(hand.value, pair.readingIndex);
    throwCard(pair);
    if (isLast) stop();
  }

  function play(): void {
    if (isPlaying.value || !isHandReady(state(), hand.value) || !isInPlay(state())) return;
    const pairs = playOrder(state(), hand.value);
    isPlaying.value = true;
    timers = pairs.map((pair, step) =>
      setTimeout(() => throwNext(pair, step === pairs.length - 1), step * PLAY_STEP_MS),
    );
  }

  /**
   * Throws every laid card still in the hand at once, as the set's time
   * runs out: the rest of a hand already playing, or one laid but not yet
   * played. Each is judged before the set ends.
   */
  function playNow(): void {
    stop();
    for (const pair of playOrder(state(), hand.value)) {
      if (!isInPlay(state())) return;
      hand.value = takeBack(hand.value, pair.readingIndex);
      throwCard(pair);
    }
  }

  onUnmounted(stop);
  return { isPlaying, stop, play, playNow };
}

export function useHand(state: () => RunState, throwCard: (pair: PlayedPair) => void) {
  const hand = shallowRef<Hand>(emptyHand(state()));
  const { isPlaying, stop, play, playNow } = usePlayback(state, hand, throwCard);

  watch(
    () => state().setIndex,
    () => {
      stop();
      hand.value = emptyHand(state());
    },
  );

  return {
    hand,
    isPlaying,
    play,
    playNow,
    isReady: computed(() => isHandReady(state(), hand.value)),
    /** The number tag a reading card shows (1 for the first word card), or undefined in hand. */
    orderOf: (readingIndex: number): number | undefined => {
      const position = positionOf(hand.value, readingIndex);
      return position === null ? undefined : position + 1;
    },
    /** Lays a reading card under the given word card, or the first one still open. */
    lay: (readingIndex: number, position?: number) => {
      if (isPlaying.value || !isInPlay(state())) return;
      hand.value = layReading(state(), hand.value, readingIndex, position);
    },
    /** Throws a dragged card straight at the word card it was dropped on. */
    throwNow: (readingIndex: number, position: number) => {
      const wordId = state().set.words[position]?.id;
      if (wordId === undefined || isPlaying.value || !isInPlay(state())) return;
      hand.value = clearForThrow(hand.value, readingIndex, position);
      throwCard({ readingIndex, wordId });
    },
    takeBack: (readingIndex: number) => {
      if (!isPlaying.value) hand.value = takeBack(hand.value, readingIndex);
    },
  };
}
