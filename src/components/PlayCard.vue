<script setup lang="ts">
/**
 * One card on the board: a word card (学校) or a reading card (がっこう),
 * drawn as a pixel-art karuta card (D32, CardFrame.vue): washi paper in
 * a crimson frame, with a red back, a suit mark in two opposite corners
 * (言 on word cards, 音 on reading cards), and the deck's JLPT level (N5 to
 * N1) in the bottom-left corner. Reading cards are written top to bottom,
 * as karuta's grab cards are; word cards carry a hanko stamp for their
 * tag. How the card moves lives in card-motion.ts.
 *
 * Every card tilts toward the mouse while it's over the card
 * (useCardTilt.ts), as a held card turns to the light.
 *
 * Reading cards can be picked up and dropped under a word card (Motion's
 * drag): the card reports where it is while dragged and where and how fast
 * it was let go, and the board decides which word card it was aimed at.
 * A laid card shifts up with a tag naming its word card (1 to 5) until
 * the hand is played; a match then sends it flying on to its word card.
 *
 * The frame's colour shows the card's state: white when aimed at, dark
 * when wrong, aqua when it's the right answer.
 * Feedback never relies on colour alone (N4): a wrong card also shakes and
 * shows ✗, a right one shows ✓. While paused, cards turn face down (D8),
 * showing the back drawn on the other side: word cards can be tapped to
 * flip them, reading cards can't.
 */
import { m, type PanInfo } from 'motion-v';
import { computed, ref } from 'vue';
import type { CardStatus } from '../game/card-status.ts';
import { cardPose, cardTransition, dealtFrom, THROW_S } from './card-motion.ts';
import type { JlptLevel } from '../deck/types.ts';
import { useCardTilt } from '../composables/useCardTilt.ts';
import { usePixelSnap } from '../composables/usePixelSnap.ts';
import CardFrame, { type FrameColour } from './CardFrame.vue';
import type { Offset, Placement, Point } from './throw-geometry.ts';

const props = defineProps<{
  text: string;
  kind: 'word' | 'reading';
  status: CardStatus;
  /** Position on the board, so cards deal in one after another. */
  index: number;
  /** The difficulty tag on word cards, such as 0.2 for "+0.2×" (L8). */
  tag?: number;
  /** Shown under the text when a timed-out set reveals its answers (L6). */
  hint?: string;
  /** Peeked at this set: matching it won't score (L9). */
  isPeeked?: boolean;
  /** For a matched reading card: how far away its word card is. */
  throwTo?: Offset;
  /** For a word card: a dragged reading card is over it. */
  isTargeted?: boolean;
  /** The deck's JLPT level, shown in the bottom-left corner. */
  level: JlptLevel;
  /** Where the deck is, so the card is dealt off it. */
  dealFrom?: Placement;
  /** For a laid reading card: the number of the word card it's laid for (1 to 5). */
  order?: number;
}>();

const emit = defineEmits<{
  tap: [];
  /** A reading card was picked up. */
  pickUp: [];
  /** While a reading card is dragged: the pointer, in page coordinates. */
  drag: [point: Point];
  /** When it's let go: the pointer, and its speed in pixels per second. */
  release: [point: Point, velocity: Point];
}>();

/** A held card grows and tilts, as a card does when picked up off the table. */
const HELD_POSE = { scale: 1.12, rotate: 6 } as const;

const { tiltStyle, follow, settle } = useCardTilt();
usePixelSnap('snapLayer', () => props.status === 'matched', THROW_S * 1000);

/** Largest text size (rem): short words are big, as on a printed card. */
const MAX_TEXT_REM = { word: 3.5, reading: 2.6 } as const;
/**
 * Share of the card's width (cqw) a line of text may fill inside the frame:
 * across the card for a word, down it for a reading (the card is 4/3 as
 * tall as it is wide).
 */
const TEXT_LENGTH_CQW = { word: 74, reading: 96 } as const;
/**
 * Text longer than this goes on two lines rather than shrinking past
 * reading. The longest N5–N4 entries are 6-character words and 9-kana
 * readings (こうとうがっこう), measured on the slice 0 decks.
 */
const ONE_LINE_MAX = 6;

const SUITS = { word: '言', reading: '音' } as const;

const STATUS_CLASSES: Partial<Record<CardStatus, string>> = {
  matched: 'pointer-events-none z-10',
  wrong: 'animate-shake',
};

const STATUS_FRAMES: Partial<Record<CardStatus, FrameColour>> = {
  selected: 'lit',
  wrong: 'ink',
  correct: 'aqua',
};

/**
 * Each side of the card fills it and hides when turned away, so turning
 * the card over (card-motion.ts) shows the front or the back.
 */
const SIDE_CLASS =
  'absolute inset-0 flex flex-col items-center justify-center px-2 backface-hidden';

const STATUS_MARKS: Partial<Record<CardStatus, string>> = { wrong: '✗', correct: '✓' };

/** Becomes true once the first deal lands, so later moves aren't staggered. */
const isDealt = ref(false);
/**
 * True from picking the card up until the click that follows letting go.
 * Reset on the next press too, as no click follows a release off the card.
 */
const wasDragged = ref(false);

const isFaceDown = computed(() => props.status === 'hidden');

/** The text, split in two halves when it's too long for one line (or column). */
const lines = computed(() => {
  const chars = [...props.text];
  if (chars.length <= ONE_LINE_MAX) return [props.text];
  const half = Math.ceil(chars.length / 2);
  return [chars.slice(0, half).join(''), chars.slice(half).join('')];
});

/** As big as the card allows: the longest line fills the card, up to the maximum. */
const textStyle = computed(() => {
  const longest = Math.max(...lines.value.map((line) => [...line].length));
  const fitted = TEXT_LENGTH_CQW[props.kind] / longest;
  return { fontSize: `min(${MAX_TEXT_REM[props.kind]}rem, ${fitted}cqw)` };
});

const frame = computed<FrameColour>(() =>
  props.isTargeted === true ? 'lit' : (STATUS_FRAMES[props.status] ?? 'crimson'),
);
const suitClass = computed(() => (props.kind === 'word' ? 'text-crimson' : 'text-steel'));

/** The top corner shows ✓, ✗ or 👁 when there is one, else the suit. */
const cornerMark = computed(
  () => STATUS_MARKS[props.status] ?? (props.isPeeked ? '👁' : SUITS[props.kind]),
);

const isDisabled = computed(
  () => props.status === 'matched' || (isFaceDown.value && props.kind === 'reading'),
);

const isThrowable = computed(
  () =>
    props.kind === 'reading' &&
    props.order === undefined &&
    (props.status === 'idle' || props.status === 'selected'),
);
/** Read once, when the card is dealt. */
const dealtPose = dealtFrom(props.dealFrom);

const pose = computed(() => cardPose({ ...props, isLaid: props.order !== undefined }));
const transition = computed(() => cardTransition(props.status, props.index, isDealt.value));

function onRelease(info: PanInfo): void {
  emit('release', info.point, info.velocity);
}

function onPickUp(): void {
  wasDragged.value = true;
  settle();
  emit('pickUp');
}

/** Letting go of a dragged card also fires a click; it isn't a tap. */
function onClick(): void {
  if (wasDragged.value) wasDragged.value = false;
  else emit('tap');
}
</script>

<template>
  <m.button
    type="button"
    class="@container relative mx-auto block aspect-[3/4] w-[min(100%,calc(var(--card-height)*0.75))] font-card whitespace-nowrap text-sumi [transform-style:preserve-3d]"
    :class="[STATUS_CLASSES[status], isThrowable ? 'cursor-grab active:cursor-grabbing' : '']"
    :initial="dealtPose"
    :animate="pose"
    :transition="transition"
    :disabled="isDisabled"
    :aria-pressed="status === 'selected'"
    :aria-label="isFaceDown ? 'Face-down card: tap to flip it' : undefined"
    lang="ja"
    :drag="isThrowable"
    drag-snap-to-origin
    :while-drag="HELD_POSE"
    @pointerdown="wasDragged = false"
    @pointermove="follow"
    @pointerleave="settle"
    @drag-start="onPickUp"
    @drag="(_event: PointerEvent, info: PanInfo) => emit('drag', info.point)"
    @drag-end="(_event: PointerEvent, info: PanInfo) => onRelease(info)"
    @click="onClick"
    @animation-complete="isDealt = true"
  >
    <span ref="snapLayer" class="absolute inset-0 [transform-style:preserve-3d]" :style="tiltStyle">
      <span :class="SIDE_CLASS" :aria-hidden="isFaceDown">
        <CardFrame :frame="frame" :is-face-down="false" />
        <span
          class="absolute top-[9cqw] left-[9cqw] text-[7cqw] leading-none"
          :class="suitClass"
          aria-hidden="true"
          >{{ cornerMark }}</span
        >
        <span
          class="absolute right-[9cqw] bottom-[9cqw] rotate-180 text-[7cqw] leading-none"
          :class="suitClass"
          aria-hidden="true"
          >{{ SUITS[kind] }}</span
        >
        <span
          class="absolute bottom-[8cqw] left-[9cqw] font-sans text-[10cqw] leading-none text-sumi/75"
          lang="en"
          data-testid="level-mark"
          >{{ level }}</span
        >
        <span
          class="relative flex flex-col items-center leading-tight"
          :class="kind === 'reading' ? '[writing-mode:vertical-rl]' : ''"
          :style="textStyle"
        >
          <span v-for="line in lines" :key="line">{{ line }}</span>
        </span>
        <span v-if="hint" class="relative font-sans text-xs text-sumi/70">{{ hint }}</span>
        <span
          v-if="tag !== undefined"
          class="absolute -top-2 -right-2 border-2 border-crimson bg-washi px-1 py-0.5 font-sans text-[0.65rem] text-crimson shadow-[0_2px_0_rgb(0_0_0/0.5)]"
          lang="en"
          >+{{ tag.toFixed(1) }}×</span
        >
        <span
          v-if="order !== undefined"
          class="absolute -top-2.5 -right-2.5 flex size-8 items-center justify-center bg-aqua font-sans text-base text-sumi shadow-[0_3px_0_rgb(0_0_0/0.5)]"
          lang="en"
          data-testid="order-tag"
          >{{ order }}</span
        >
      </span>
      <span :class="[SIDE_CLASS, 'rotate-y-180 text-3xl text-aqua']" aria-hidden="true">
        <CardFrame frame="crimson" :is-face-down="true" />
        <span class="relative">{{ kind === 'word' ? '札' : '' }}</span>
      </span>
    </span>
  </m.button>
</template>
