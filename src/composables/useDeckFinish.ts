/**
 * Word mode's finish line (D61): a run ends when today's deck (the reviews
 * due plus the day's new words, daily-deck.ts) is cleared. The moment it
 * clears, `onFinish` runs (the screen banks the pot and pauses) and the
 * results show; "Keep practising" hides them and play goes on. A deck
 * already cleared when the run started never finishes again that day.
 */
import { ref, watch } from 'vue';

export function useDeckFinish(isCleared: () => boolean, onFinish: () => void) {
  const isShown = ref(false);
  let hasFinished = isCleared();

  watch(isCleared, (cleared) => {
    if (!cleared || hasFinished) return;
    hasFinished = true;
    isShown.value = true;
    onFinish();
  });

  return {
    isShown,
    keepPractising: () => {
      isShown.value = false;
    },
  };
}
