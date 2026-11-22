/**
 * Plays the pixel snap (pixel-snap.ts) on a card's layer when the card is
 * matched: its blocks blink out in a front sweeping from the top-left
 * corner, starting when the throw hits. Each card gets its own random
 * edge. Under reduced motion, or where the browser can't run Web
 * Animations, the card is hidden at once instead.
 */
import { useReducedMotion } from 'motion-v';
import { useTemplateRef, watch } from 'vue';
import { snapFrames, snapOrder, toClipPath } from '../components/pixel-snap.ts';

/** How long the snap takes, from the first block to the last. */
const SNAP_MS = 650;

/** Snaps the element with the template ref `refName` once `isMatched` turns true. */
export function usePixelSnap(refName: string, isMatched: () => boolean, delayMs: number): void {
  const layer = useTemplateRef<HTMLElement>(refName);
  const isReducedMotion = useReducedMotion();

  function snap(element: HTMLElement): void {
    if (isReducedMotion.value === true || typeof element.animate !== 'function') {
      element.style.visibility = 'hidden';
      return;
    }
    // The layer's own size, untouched by the card's transforms, which the clip path is drawn in.
    const { offsetWidth: width, offsetHeight: height } = element;
    const frames = snapFrames(snapOrder(Math.random)).map((runs) => ({
      clipPath: toClipPath(runs, width, height),
    }));
    element.animate(frames, { duration: SNAP_MS, delay: delayMs, fill: 'forwards' });
  }

  watch(isMatched, (matched) => {
    if (matched && layer.value !== null) snap(layer.value);
  });
}
