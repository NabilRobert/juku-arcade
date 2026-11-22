/**
 * Runs actions after a delay, and cancels any still waiting when the
 * component goes, so a timer never fires into a screen that has left.
 * Used by the word board's game feel and kanji mode's playback.
 */
import { onUnmounted } from 'vue';

export function useLater(): (action: () => void, delayMs: number) => void {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  onUnmounted(() => {
    for (const timer of timers) clearTimeout(timer);
  });
  return (action, delayMs) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      action();
    }, delayMs);
    timers.add(timer);
  };
}
