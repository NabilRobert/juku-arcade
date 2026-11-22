/**
 * A card that tilts toward the mouse while it's over the card, and eases
 * back flat when the mouse leaves or the card is picked up (card-tilt.ts
 * has the maths). The tilt is a CSS transform on a layer inside the card,
 * so it adds to whatever Motion is doing with the card itself (floating,
 * flipping, flying). It stays off when the system asks for reduced motion.
 */
import { useReducedMotion } from 'motion-v';
import { computed, ref } from 'vue';
import { NO_TILT, tiltToward, type Tilt } from '../components/card-tilt.ts';

/** Depth for the tilt; smaller looks more dramatic. */
const TILT_PERSPECTIVE_PX = 600;
/** Following the mouse is quick; settling back is slower, so it doesn't snap. */
const FOLLOW_S = 0.08;
const SETTLE_S = 0.45;

export function useCardTilt() {
  const tilt = ref<Tilt>(NO_TILT);
  const isTilted = ref(false);
  const isReducedMotion = useReducedMotion();

  function follow(event: PointerEvent): void {
    // While a button is held the card is being dragged; Motion's drag pose leads then.
    if (event.buttons !== 0 || isReducedMotion.value === true) return;
    if (!(event.currentTarget instanceof Element)) return;
    tilt.value = tiltToward(
      { x: event.clientX, y: event.clientY },
      event.currentTarget.getBoundingClientRect(),
    );
    isTilted.value = true;
  }

  function settle(): void {
    tilt.value = NO_TILT;
    isTilted.value = false;
  }

  const tiltStyle = computed(() => ({
    transform: `perspective(${TILT_PERSPECTIVE_PX}px) rotateX(${tilt.value.rotateX}deg) rotateY(${tilt.value.rotateY}deg)`,
    transition: `transform ${isTilted.value ? FOLLOW_S : SETTLE_S}s ease-out`,
  }));

  return { tiltStyle, follow, settle };
}
