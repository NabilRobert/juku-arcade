<script setup lang="ts">
/**
 * One Bunpou tile (D56): a word or particle on paper, in the game's pixel
 * button style, with furigana under its kanji (the mode's rule; word
 * mode's furigana sits above). Tap it, or drag it: a drag reports where
 * it was let go, and the board places the tile there. A press that
 * wobbles less than TAP_SLOP_PX still counts as a tap, as with the cards.
 * Every tile is the same size (TEXT_SIZES). While paused it turns face down, showing the card back, at the same
 * size so nothing on the table moves (D8). A line's tiles are dealt in
 * like word mode's cards (D58): one after another from above, each with
 * the card-landing tap, a little higher than the one before.
 * On a wide screen (lg) a tile is at most a fifth of the board's width, less
 * the gaps and the boxes' padding (cqw: the board is a size container), so a
 * sentence of five tiles always fits on one row, even on a 4:3 tablet in
 * landscape, where 12rem tiles wrapped and the screen scrolled.
 */
import { m, type PanInfo } from 'motion-v';
import { parseFurigana } from '../../deck/furigana.ts';
import { computed, onMounted } from 'vue';
import { useLater } from '../../composables/useLater.ts';
import { hoverPitch, playSound } from '../../sound/sfx.ts';
import {
  dealDelayMs,
  tileDealTransition,
  TILE_DEALT_FROM,
  TILE_RESTING,
} from '../cards/card-motion.ts';
import { isDrag, type Point } from '../cards/throw-geometry.ts';
import FuriganaText from '../words/FuriganaText.vue';

const props = defineProps<{
  marked: string;
  /** Its key on the keyboard, 1–5, while it's offered. */
  number?: number;
  isWrong?: boolean;
  isDraggable?: boolean;
  isFaceDown?: boolean;
  /** Its place in a fresh deal, so it's dealt in; left out, it just appears (a tile taken back). */
  dealIndex?: number;
}>();
const emit = defineEmits<{ tap: []; release: [point: Point] }>();

const HELD_POSE = { scale: 1.1, rotate: 4 } as const;

const later = useLater();
onMounted(() => {
  const index = props.dealIndex;
  if (index !== undefined) later(() => playSound('deal', hoverPitch(index)), dealDelayMs(index));
});

/**
 * Every tile is the same size, so a line looks tidy whatever its words;
 * a longer phrase gets a smaller font to fit. The steps are by how many
 * characters the tile reads, without its furigana.
 */
// A step smaller on a phone-width screen, where the tile is narrower.
const TEXT_SIZES: readonly { upTo: number; size: string }[] = [
  { upTo: 3, size: 'text-3xl sm:text-4xl' },
  { upTo: 4, size: 'text-2xl sm:text-3xl' },
  { upTo: 6, size: 'text-xl sm:text-2xl' },
  { upTo: 8, size: 'text-lg sm:text-xl' },
];
const SMALLEST_TEXT = 'text-sm sm:text-base';
const textSize = computed(() => {
  const length = parseFurigana(props.marked).reduce((total, piece) => total + piece.text.length, 0);
  return TEXT_SIZES.find((step) => length <= step.upTo)?.size ?? SMALLEST_TEXT;
});

const faceClass = computed(() => {
  if (props.isFaceDown) return 'card-back';
  return props.isWrong ? 'bg-crimson text-washi' : 'washi';
});
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
    :initial="dealIndex === undefined ? false : TILE_DEALT_FROM"
    :animate="TILE_RESTING"
    :transition="tileDealTransition(dealIndex ?? 0)"
    :while-drag="HELD_POSE"
    class="relative"
    @drag-end="(_event: PointerEvent, info: PanInfo) => onRelease(info)"
  >
    <button
      type="button"
      class="pixel-button flex h-16 w-38 items-center justify-center px-2 text-sumi sm:h-24 sm:w-48 lg:w-[min(12rem,calc((100cqw-4rem)/5))]"
      :class="[faceClass, textSize]"
      :data-wrong="isWrong === true ? '' : undefined"
      :disabled="isFaceDown"
      :aria-label="isFaceDown ? 'Face-down tile' : undefined"
      @pointerdown="onPress"
      @click="onClick"
    >
      <FuriganaText :class="{ invisible: isFaceDown }" :marked="marked" is-reading-below />
    </button>
    <span
      v-if="number !== undefined && !isFaceDown"
      class="absolute -top-2 -left-2 text-xs text-aqua"
      >{{ number }}</span
    >
  </m.div>
</template>
