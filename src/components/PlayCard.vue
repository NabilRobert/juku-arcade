<script setup lang="ts">
/**
 * One card on the board: a word card (学校) or a reading card (がっこう).
 * Every card on the board is this component, so cards look and behave alike.
 */
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  kind: 'word' | 'reading';
}>();

/**
 * Text longer than this gets a smaller font, so it stays on one line. The
 * longest N5–N4 entries are 6-character words and 9-kana readings
 * (こうとうがっこう), measured on the slice 0 decks.
 */
const LONG_TEXT_LENGTH = { word: 4, reading: 6 } as const;

const sizeClass = computed(() => {
  const isLong = [...props.text].length > LONG_TEXT_LENGTH[props.kind];
  if (props.kind === 'word') return isLong ? 'text-xl' : 'text-2xl';
  return isLong ? 'text-base' : 'text-lg';
});
</script>

<template>
  <button
    type="button"
    class="flex min-h-16 min-w-11 items-center justify-center rounded-xl border px-1 py-3 font-sans whitespace-nowrap text-slate-900 shadow-md"
    :class="[
      sizeClass,
      kind === 'word'
        ? 'border-amber-300/60 bg-amber-50 font-semibold'
        : 'border-sky-300/60 bg-sky-50',
    ]"
    lang="ja"
  >
    {{ text }}
  </button>
</template>
