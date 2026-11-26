/**
 * True while the window is at least Tailwind's lg breakpoint wide (64rem),
 * where a mode's side panel sits beside the board; below it, the panel is
 * a drawer (SidePanel.vue). Follows the window as it's resized. Plain
 * matchMedia: a library would be heavier than these few lines.
 */
import { onMounted, onUnmounted, ref } from 'vue';

const WIDE_QUERY = '(min-width: 64rem)';

export function useIsWide() {
  const isWide = ref(true);
  let query: MediaQueryList | null = null;
  const update = (): void => {
    isWide.value = query?.matches ?? true;
  };
  onMounted(() => {
    query = window.matchMedia(WIDE_QUERY);
    update();
    query.addEventListener('change', update);
  });
  onUnmounted(() => query?.removeEventListener('change', update));
  return isWide;
}
