/**
 * Word mode's finish line (D70): clearing today's deck (the reviews due
 * plus the day's new words, daily-deck.ts) no longer stops the run. A
 * banner shows for a few seconds (`isBannerShown`) and play goes on
 * (playtest decision, 2026-11-26: the old results screen "cut me off more
 * than anything"). A deck already cleared when the run started gets no
 * banner that day.
 *
 * The run's results come only from End run (`endNow`): `onEnd` runs (the
 * screen banks the pot and pauses) and they show; "Keep playing" hides
 * them and play goes on. Every coin banked in a run counts toward the best.
 */
import { getCurrentScope, onScopeDispose, ref, watch } from 'vue';

/** How long the "today's deck done" banner stays up. */
export const BANNER_MS = 3500;

export function useDeckFinish(isCleared: () => boolean, onEnd: () => void) {
  const isShown = ref(false);
  const isBannerShown = ref(false);
  let hasCleared = isCleared();
  let bannerTimer: ReturnType<typeof setTimeout> | undefined;

  watch(isCleared, (cleared) => {
    if (!cleared || hasCleared) return;
    hasCleared = true;
    isBannerShown.value = true;
    bannerTimer = setTimeout(() => {
      isBannerShown.value = false;
    }, BANNER_MS);
  });
  if (getCurrentScope()) onScopeDispose(() => clearTimeout(bannerTimer));

  return {
    /** True while End run's results show. */
    isShown,
    isBannerShown,
    endNow: () => {
      isShown.value = true;
      onEnd();
    },
    keepPlaying: () => {
      isShown.value = false;
    },
  };
}
