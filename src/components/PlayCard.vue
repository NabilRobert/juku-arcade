<script setup lang="ts">
/**
 * One card on the board: a word card (学校) or a reading card (がっこう).
 * Every card on the board is this component, so cards look and behave alike.
 * Feedback never relies on colour alone (N4): a wrong card also shakes and
 * shows ✗, a right one shows ✓.
 */
import { computed } from 'vue';
import type { CardStatus } from '../game/card-status.ts';

const props = defineProps<{
  text: string;
  kind: 'word' | 'reading';
  status: CardStatus;
  /** The difficulty tag on word cards, such as 0.2 for "+0.2×" (L8). */
  tag?: number;
  /** Shown under the text when a timed-out set reveals its answers (L6). */
  hint?: string;
}>();

defineEmits<{ tap: [] }>();

/**
 * Text longer than this gets a smaller font, so it stays on one line. The
 * longest N5–N4 entries are 6-character words and 9-kana readings
 * (こうとうがっこう), measured on the slice 0 decks.
 */
const LONG_TEXT_LENGTH = { word: 4, reading: 6 } as const;

const STATUS_CLASSES: Record<CardStatus, string> = {
  idle: '',
  selected: 'ring-4 ring-amber-400 -translate-y-1',
  matched: 'invisible',
  wrong: 'animate-shake ring-4 ring-rose-500',
  correct: 'ring-4 ring-emerald-500',
};

const sizeClass = computed(() => {
  const isLong = [...props.text].length > LONG_TEXT_LENGTH[props.kind];
  if (props.kind === 'word') return isLong ? 'text-xl' : 'text-2xl';
  return isLong ? 'text-base' : 'text-lg';
});

const kindClass = computed(() =>
  props.kind === 'word'
    ? 'border-amber-300/60 bg-amber-50 font-semibold'
    : 'border-sky-300/60 bg-sky-50',
);

const STATUS_MARKS: Partial<Record<CardStatus, string>> = { wrong: '✗', correct: '✓' };

const statusMark = computed(() => STATUS_MARKS[props.status] ?? '');
</script>

<template>
  <button
    type="button"
    class="relative flex min-h-16 min-w-11 flex-col items-center justify-center rounded-xl border px-1 py-3 font-sans whitespace-nowrap text-slate-900 shadow-md transition-transform"
    :class="[sizeClass, kindClass, STATUS_CLASSES[status]]"
    :disabled="status === 'matched'"
    :aria-pressed="status === 'selected'"
    lang="ja"
    @click="$emit('tap')"
  >
    <span>{{ text }}</span>
    <span v-if="hint" class="text-xs font-normal text-slate-600">{{ hint }}</span>
    <span
      v-if="tag !== undefined"
      class="absolute top-0.5 right-1 text-[0.65rem] font-normal text-amber-700"
      lang="en"
      >+{{ tag.toFixed(1) }}×</span
    >
    <span v-if="statusMark" class="absolute top-0.5 left-1 text-sm" aria-hidden="true">{{
      statusMark
    }}</span>
  </button>
</template>
