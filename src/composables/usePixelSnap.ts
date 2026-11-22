/**
 * Plays the pixel snap (pixel-snap.ts) on a card's layer when the card is
 * matched: its blocks blink out sweeping from the top-left corner,
 * starting when the throw hits. Each card gets its own random edge.
 *
 * Every mask is decoded while the card is still flying: a mask the browser
 * meets undecoded shows for a moment as a flash of the whole card. Under
 * reduced motion, or where the browser can't animate masks, the card is
 * hidden at once instead.
 */
import { useReducedMotion } from 'motion-v';
import { useTemplateRef, watch } from 'vue';
import { snapMasks, snapOrder } from '../components/pixel-snap.ts';

/** How long the snap takes, from the first block to the last. */
const SNAP_MS = 650;

/** Decodes a mask image, so swapping it in later costs nothing. Never rejects. */
async function decode(dataUrl: string): Promise<void> {
  const image = new Image();
  image.src = dataUrl;
  try {
    await image.decode();
  } catch {
    // An image that can't be decoded early is decoded when it's shown; that's only slower.
  }
}

/** Resolves when every mask is decoded, or after `limitMs`, whichever is sooner. */
function decodeWithin(masks: readonly string[], limitMs: number): Promise<unknown> {
  const limit = new Promise((resolve) => setTimeout(resolve, limitMs));
  return Promise.race([Promise.all(masks.map(decode)), limit]);
}

/** Snaps the element with the template ref `refName` once `isMatched` turns true. */
export function usePixelSnap(refName: string, isMatched: () => boolean, delayMs: number): void {
  const layer = useTemplateRef<HTMLElement>(refName);
  const isReducedMotion = useReducedMotion();

  async function snap(element: HTMLElement): Promise<void> {
    if (isReducedMotion.value === true || typeof element.animate !== 'function') {
      element.style.visibility = 'hidden';
      return;
    }
    const masks = snapMasks(snapOrder(Math.random));
    const startedMs = performance.now();
    await decodeWithin(masks, delayMs);
    const frames = masks.map((mask) => {
      const image = `url("${mask}")`;
      return { maskImage: image, webkitMaskImage: image };
    });
    const remainingDelayMs = Math.max(0, delayMs - (performance.now() - startedMs));
    element.animate(frames, { duration: SNAP_MS, delay: remainingDelayMs, fill: 'forwards' });
  }

  watch(isMatched, (matched) => {
    if (matched && layer.value !== null) void snap(layer.value);
  });
}
