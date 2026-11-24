<script setup lang="ts">
/**
 * One Bunpou tile (D56): a word or particle on paper, in the game's pixel
 * button style, with furigana under its kanji (the mode's rule; word
 * mode's furigana sits above). Tap it, or drag it: a drag reports where
 * it was let go, and the board places the tile there. A press that
 * wobbles less than TAP_SLOP_PX still counts as a tap, as with the cards.
 */
import { m, type PanInfo } from 'motion-v';
import { isDrag, type Point } from '../cards/throw-geometry.ts';
import FuriganaText from '../words/FuriganaText.vue';

const props = defineProps<{
  marked: string;
  /** Its key on the keyboard, 1–5, while it's offered. */
  number?: number;
  isWrong?: boolean;
  isDraggable?: boolean;
}>();
const emit = defineEmits<{ tap: []; release: [point: Point] }>();

const HELD_POSE = { scale: 1.1, rotate: 4 } as const;
let pressedAt: Point | null = null;

function onPress(event: PointerEvent): void {
  pressedAt = { x: event.clientX, y: event.clientY };
}

/** Letting go of a drag also fires a click; that isn't a tap. A keyboard click (detail 0) always is. */
function onClick(event: MouseEvent): void {
  const wasDragged =
    event.detail !== 0 &&
    pressedAt !== null &&
    isDrag(pressedAt, { x: event.clientX, y: event.clientY });
  if (!wasDragged) emit('tap');
}

function onRelease(info: PanInfo): void {
  if (isDrag({ x: 0, y: 0 }, info.offset)) emit('release', info.point);
}
</script>

<template>
  <m.div
    :drag="props.isDraggable === true"
    drag-snap-to-origin
    :while-drag="HELD_POSE"
    class="relative"
    @drag-end="(_event: PointerEvent, info: PanInfo) => onRelease(info)"
  >
    <button
      type="button"
      class="pixel-button min-w-20 px-5 pt-3 pb-[1.1em] text-4xl text-sumi"
      :class="isWrong ? 'bg-crimson text-washi' : 'washi'"
      :data-wrong="isWrong === true ? '' : undefined"
      @pointerdown="onPress"
      @click="onClick"
    >
      <FuriganaText :marked="marked" is-reading-below />
    </button>
    <span v-if="number !== undefined" class="absolute -top-2 -left-2 text-xs text-aqua">{{
      number
    }}</span>
  </m.div>
</template>
