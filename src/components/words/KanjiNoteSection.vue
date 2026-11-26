<script setup lang="ts">
/**
 * One kanji's notes on a card back: the kanji and its meanings (unless the
 * card's title already shows it), every reading, with the ones a word uses
 * picked out in crimson, and other words that use it. Used once per kanji
 * on a word's back (CardBack.vue) and on a kanji's own back
 * (KanjiCardBack.vue).
 */
import type { KanjiNote } from '../../deck/types.ts';

withDefaults(
  defineProps<{
    char: string;
    note: KanjiNote;
    /** The readings the word on this card uses, picked out; none on a kanji's own back. */
    used?: readonly string[];
    others: readonly { word: string; reading: string }[];
    isHeadingShown?: boolean;
  }>(),
  { used: () => [], isHeadingShown: true },
);
</script>

<template>
  <section class="border-t border-sumi/15 pt-3">
    <p v-if="isHeadingShown" class="flex items-baseline gap-3">
      <span class="text-3xl" lang="ja">{{ char }}</span>
      <span class="text-sm text-sumi/70">{{ note.meanings.slice(0, 3).join(', ') }}</span>
    </p>
    <p class="mt-1 flex flex-wrap gap-1.5" lang="ja">
      <span
        v-for="reading in [...note.onyomi, ...note.kunyomi]"
        :key="reading"
        class="px-1.5 py-0.5 text-sm"
        data-testid="kanji-reading"
        :class="used.includes(reading) ? 'bg-crimson font-semibold text-washi' : 'bg-washi-shade'"
        >{{ reading }}</span
      >
    </p>
    <p v-if="others.length" class="mt-1 text-sm text-sumi/70" lang="ja">
      <span v-for="other in others" :key="other.word" class="mr-3"
        >{{ other.word }} {{ other.reading }}</span
      >
    </p>
  </section>
</template>
