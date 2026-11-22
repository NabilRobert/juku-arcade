/**
 * Plays the pixel snap (pixel-snap.ts) on a card's layer when the card is
 * matched: its blocks blink out in a front sweeping from the top-left
 * corner, starting when the throw hits. Each card gets its own random
 * edge. When the snap ends, or is interrupted, the card is hidden outright.
 * Under reduced motion, or where the browser can't run Web Animations or
 * the card has no size yet, it's hidden at once instead.
 */
import { useReducedMotion } from 'motion-v';
import { useTemplateRef, watch } from 'vue';
import { snapFrames, snapOrder, toClipPath } from '../components/cards/pixel-snap.ts';

/** How long the snap takes, from the first block to the last. */
const SNAP_MS = 650;

/** Snaps the element with the template ref `refName` once `isMatched` turns true. */
export function usePixelSnap(refName: string, isMatched: () => boolean, delayMs: number): void {
  const layer = useTemplateRef<HTMLElement>(refName);
  const isReducedMotion = useReducedMotion();

  function hide(element: HTMLElement): void {
    element.style.visibility = 'hidden';
  }

  function snap(element: HTMLElement): void {
    // The layer's own size, untouched by the card's transforms, which the clip path is drawn in.
    const { offsetWidth: width, offsetHeight: height } = element;
    const canAnimate = typeof element.animate === 'function' && width > 0 && height > 0;
    if (isReducedMotion.value === true || !canAnimate) return hide(element);
    const frames = snapFrames(snapOrder(Math.random)).map((runs) => ({
      clipPath: toClipPath(runs, width, height),
    }));
    const animation = element.animate(frames, {
      duration: SNAP_MS,
      delay: delayMs,
      fill: 'forwards',
    });
    // Finished or interrupted, a snapped card must never be left part-way on the table.
    animation.finished.then(
      () => hide(element),
      () => hide(element),
    );
  }

  watch(isMatched, (matched) => {
    if (matched && layer.value !== null) snap(layer.value);
  });
}
