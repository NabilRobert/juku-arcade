<script setup lang="ts">
/**
 * One card on the board: a word card (学校) or a reading card (がっこう),
 * drawn as a card from a deck (D30): upright, with an inner frame and a
 * suit mark in two opposite corners. Word cards have a vermilion frame,
 * the suit 言 and a hanko stamp for their tag; reading cards have a pine
 * frame and the suit 音. How the card moves lives in card-motion.ts: a
 * matched reading card is thrown at its word card and knocks it down.
 *
 * Feedback never relies on colour alone (N4): a wrong card also shakes and
 * shows ✗, a right one shows ✓. While paused, cards are face down (D8):
 * word cards can be tapped to flip them, reading cards can't.
 */
import { m } from 'motion-v';
import { computed, ref } from 'vue';
import type { CardStatus } from '../game/card-status.ts';
import type { Offset } from '../composables/useThrows.ts';
import { cardPose, cardTransition, DEAL_FROM } from './card-motion.ts';

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
}>();

defineEmits<{ tap: [] }>();

/** Largest text size (rem): short words are bold and big, as on a printed card. */
const MAX_TEXT_REM = { word: 2.5, reading: 1.6 } as const;
/** Share of the card's width (cqw) the text may fill, inside the frame. */
const TEXT_WIDTH_CQW = 78;
/**
 * Text longer than this goes on two lines rather than shrinking past
 * reading. The longest N5–N4 entries are 6-character words and 9-kana
 * readings (こうとうがっこう), measured on the slice 0 decks.
 */
const ONE_LINE_MAX = 6;

const SUITS = { word: '言', reading: '音' } as const;

const STATUS_CLASSES: Record<CardStatus, string> = {
  idle: '',
  selected: 'ring-4 ring-gold',
  matched: 'pointer-events-none z-10',
  wrong: 'animate-shake ring-4 ring-vermilion',
  correct: 'ring-4 ring-pine-light',
  hidden: '',
};

const STATUS_MARKS: Partial<Record<CardStatus, string>> = { wrong: '✗', correct: '✓' };

/** Becomes true once the first deal lands, so later moves aren't staggered. */
const isDealt = ref(false);

const isFaceDown = computed(() => props.status === 'hidden');

/** The text, split in two halves when it's too long for one line. */
const lines = computed(() => {
  const chars = [...props.text];
  if (chars.length <= ONE_LINE_MAX) return [props.text];
  const half = Math.ceil(chars.length / 2);
  return [chars.slice(0, half).join(''), chars.slice(half).join('')];
});

/** As big as the card allows: the longest line fills the card's width, up to the maximum. */
const textStyle = computed(() => {
  const longest = Math.max(...lines.value.map((line) => [...line].length));
  return { fontSize: `min(${MAX_TEXT_REM[props.kind]}rem, ${TEXT_WIDTH_CQW / longest}cqw)` };
});

const faceClass = computed(() => (isFaceDown.value ? 'card-back text-gold' : 'washi text-sumi'));
const frameClass = computed(() =>
  props.kind === 'word' ? 'border-vermilion/60' : 'border-pine/60',
);
const suitClass = computed(() => (props.kind === 'word' ? 'text-vermilion' : 'text-pine'));

/** The top corner shows ✓, ✗ or 👁 when there is one, else the suit. */
const cornerMark = computed(
  () => STATUS_MARKS[props.status] ?? (props.isPeeked ? '👁' : SUITS[props.kind]),
);

const isDisabled = computed(
  () => props.status === 'matched' || (isFaceDown.value && props.kind === 'reading'),
);

const pose = computed(() => cardPose(props.status, props.kind, props.index, props.throwTo));
const transition = computed(() => cardTransition(props.status, props.index, isDealt.value));
</script>

<template>
  <m.button
    type="button"
    class="@container relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl px-2 font-card whitespace-nowrap shadow-[0_1px_0_#d8cbb0,0_2px_0_#b3a27c,0_3px_0_#8f7f5c,0_10px_18px_rgb(0_0_0/0.5)]"
    :class="[faceClass, STATUS_CLASSES[status]]"
    :initial="DEAL_FROM"
    :animate="pose"
    :transition="transition"
    :disabled="isDisabled"
    :aria-pressed="status === 'selected'"
    :aria-label="isFaceDown ? 'Face-down card: tap to flip it' : undefined"
    lang="ja"
    @click="$emit('tap')"
    @animation-complete="isDealt = true"
  >
    <span v-if="isFaceDown" aria-hidden="true" class="text-3xl">{{
      kind === 'word' ? '札' : ''
    }}</span>
    <template v-else>
      <span
        class="pointer-events-none absolute inset-1.5 rounded-lg border"
        :class="frameClass"
        aria-hidden="true"
      />
      <span
        class="absolute top-2 left-2.5 text-xs leading-none"
        :class="suitClass"
        aria-hidden="true"
        >{{ cornerMark }}</span
      >
      <span
        class="absolute right-2.5 bottom-2 rotate-180 text-xs leading-none"
        :class="suitClass"
        aria-hidden="true"
        >{{ SUITS[kind] }}</span
      >
      <span class="flex flex-col items-center leading-tight font-semibold" :style="textStyle">
        <span v-for="line in lines" :key="line">{{ line }}</span>
      </span>
      <span v-if="hint" class="font-sans text-xs text-sumi/70">{{ hint }}</span>
      <span
        v-if="tag !== undefined"
        class="absolute -top-2 -right-2 rounded-md bg-vermilion px-1 py-0.5 font-sans text-[0.65rem] font-bold text-washi shadow"
        lang="en"
        >+{{ tag.toFixed(1) }}×</span
      >
    </template>
  </m.button>
</template>
