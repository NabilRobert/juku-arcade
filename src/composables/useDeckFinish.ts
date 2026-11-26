/**
 * Word mode's finish line (D61): a run ends when today's deck (the reviews
 * due plus the day's new words, daily-deck.ts) is cleared. The moment it
 * clears, `onFinish` runs (the screen banks the pot and pauses) and the
 * results show; "Keep practising" hides them and play goes on. A deck
 * already cleared when the run started never finishes again that day.
 *
 * `isRanked` is true while the run's coins count toward the best and the
 * leaderboard: until the deck is cleared, including the pot banked at that
 * moment. Coins from practice after it (or from a run that started with
 * the deck already cleared) don't count, so the board can't be won by
 * playing longer.
 *
 * End run (`endNow`) shows the same results early, with the pot banked; the
 * deck isn't cleared, so play after "Keep playing" still counts.
 */
import { nextTick, ref, watch } from 'vue';

export function useDeckFinish(isCleared: () => boolean, onFinish: () => void) {
  const isShown = ref(false);
  /** True while the results show because the player ended the run, not because the deck cleared. */
  const isEndedEarly = ref(false);
  let hasFinished = isCleared();
  const isRanked = ref(!hasFinished);

  watch(isCleared, (cleared) => {
    if (!cleared || hasFinished) return;
    hasFinished = true;
    isShown.value = true;
    onFinish();
    // The pot banked just now still counts; only play after this tick is practice.
    void nextTick(() => {
      isRanked.value = false;
    });
  });

  return {
    isShown,
    isRanked,
    isEndedEarly,
    endNow: () => {
      isEndedEarly.value = true;
      isShown.value = true;
      onFinish();
    },
    keepPractising: () => {
      isShown.value = false;
      isEndedEarly.value = false;
    },
  };
}
