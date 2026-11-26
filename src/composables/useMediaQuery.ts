/**
 * True while a CSS media query matches, following the window as it's
 * resized or turned (useIsWide.ts, usePhoneLandscape.ts). Plain matchMedia:
 * a library would be heavier than these few lines. Reads `fallback` until
 * the component is on the page.
 *
 * It listens for the query's own change event and also re-checks on every
 * resize: a browser's device emulation can resize the page without firing
 * the change event, which left the rotate notice up after the "phone" was
 * turned back.
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
    window.addEventListener('resize', update);
  });
  onUnmounted(() => {
    list?.removeEventListener('change', update);
    window.removeEventListener('resize', update);
  });
  return matches;
}
