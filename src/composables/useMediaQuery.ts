/**
 * True while a CSS media query matches, following the window as it's
 * resized or turned (useIsWide.ts, usePhoneLandscape.ts). Plain matchMedia:
 * a library would be heavier than these few lines. Reads `fallback` until
 * the component is on the page.
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export function useMediaQuery(query: string, fallback: boolean): Readonly<Ref<boolean>> {
  const matches = ref(fallback);
  let list: MediaQueryList | null = null;
  const update = (): void => {
    matches.value = list?.matches ?? fallback;
  };
  onMounted(() => {
    list = window.matchMedia(query);
    update();
    list.addEventListener('change', update);
  });
  onUnmounted(() => list?.removeEventListener('change', update));
  return matches;
}
