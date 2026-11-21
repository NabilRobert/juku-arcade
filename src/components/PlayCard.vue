<script setup lang="ts">
/**
 * One card on the board: a word card (学校) or a reading card (がっこう),
 * styled as a karuta card (D30). Word cards have a vermilion frame and a
 * hanko stamp for their tag; reading cards have a pine frame, as karuta's
 * two kinds of card differ. Motion deals the card in, lifts it when
 * selected, and flies it off when matched; it follows reduce-motion.
 *
 * Feedback never relies on colour alone (N4): a wrong card also shakes and
 * shows ✗, a right one shows ✓. While paused, cards are face down (D8):
 * word cards can be tapped to flip them, reading cards can't.
 */
import { m } from 'motion-v';
import { computed } from 'vue';
import type { CardStatus } from '../game/card-status.ts';

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
}>();

defineEmits<{ tap: [] }>();

/**
 * Text longer than this gets a smaller font, so it stays on one line. The
 * longest N5–N4 entries are 6-character words and 9-kana readings
 * (こうとうがっこう), measured on the slice 0 decks.
 */
const LONG_TEXT_LENGTH = { word: 4, reading: 6 } as const;
/** Seconds between one card dealing in and the next. */
const DEAL_STAGGER_S = 0.04;

const STATUS_CLASSES: Record<CardStatus, string> = {
  idle: '',
  selected: 'ring-4 ring-gold',
  matched: 'pointer-events-none',
  wrong: 'animate-shake ring-4 ring-vermilion',
  correct: 'ring-4 ring-pine-light',
  hidden: '',
};

const STATUS_MARKS: Partial<Record<CardStatus, string>> = { wrong: '✗', correct: '✓' };

const isFaceDown = computed(() => props.status === 'hidden');

const sizeClass = computed(() => {
  const isLong = [...props.text].length > LONG_TEXT_LENGTH[props.kind];
  if (props.kind === 'word') return isLong ? 'text-xl' : 'text-3xl';
  return isLong ? 'text-base' : 'text-xl';
});

const faceClass = computed(() => {
  if (isFaceDown.value) return 'card-back text-gold';
  const frame = props.kind === 'word' ? 'border-vermilion/70' : 'border-pine/70';
  return `washi border-2 ${frame} text-sumi`;
});

const cornerMark = computed(() => STATUS_MARKS[props.status] ?? (props.isPeeked ? '👁' : ''));

const isDisabled = computed(
  () => props.status === 'matched' || (isFaceDown.value && props.kind === 'reading'),
);

/** Where Motion moves the card: up a little when selected, up and away when matched. */
const pose = computed(() => {
  if (props.status === 'matched') return { opacity: 0, y: -28, scale: 0.8, rotate: 0 };
  if (props.status === 'selected') return { opacity: 1, y: -6, scale: 1.04, rotate: 0 };
  return { opacity: 1, y: 0, scale: 1, rotate: 0 };
});
</script>

<template>
  <m.button
    type="button"
    class="relative flex min-h-18 min-w-11 flex-col items-center justify-center rounded-lg px-1 py-3 font-card whitespace-nowrap shadow-[0_6px_14px_rgb(0_0_0/0.45)]"
    :class="[sizeClass, faceClass, STATUS_CLASSES[status]]"
    :initial="{ opacity: 0, y: -40, rotate: -4 }"
    :animate="pose"
    :transition="{ type: 'spring', stiffness: 420, damping: 28, delay: index * DEAL_STAGGER_S }"
    :disabled="isDisabled"
    :aria-pressed="status === 'selected'"
    :aria-label="isFaceDown ? 'Face-down card: tap to flip it' : undefined"
    lang="ja"
    @click="$emit('tap')"
  >
    <span v-if="isFaceDown" aria-hidden="true" class="text-2xl">{{
      kind === 'word' ? '札' : ''
    }}</span>
    <span v-else class="font-semibold">{{ text }}</span>
    <span v-if="hint" class="font-sans text-xs text-sumi/70">{{ hint }}</span>
    <span
      v-if="tag !== undefined && !isFaceDown"
      class="absolute -top-2 -right-2 rounded-md bg-vermilion px-1 py-0.5 font-sans text-[0.65rem] font-bold text-washi shadow"
      lang="en"
      >+{{ tag.toFixed(1) }}×</span
    >
    <span v-if="cornerMark" class="absolute top-0.5 left-1 font-sans text-sm" aria-hidden="true">{{
      cornerMark
    }}</span>
  </m.button>
</template>
