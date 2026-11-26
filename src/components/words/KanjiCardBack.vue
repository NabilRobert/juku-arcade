<script setup lang="ts">
/**
 * A kanji's own card back: the kanji, its meanings, every reading and the
 * words that use it. Opened by clicking a kanji in the streak's day detail
 * (playtest decision, 2026-11-26). Built from the same panel and kanji notes
 * as a word's back (CardBack.vue), so the two look alike.
 */
import type { KanjiNote } from '../../deck/types.ts';
import CardBackPanel from './CardBackPanel.vue';
import KanjiNoteSection from './KanjiNoteSection.vue';

defineProps<{ char: string; note: KanjiNote }>();
defineEmits<{ close: [] }>();
</script>

<template>
  <CardBackPanel @close="$emit('close')">
    <template #title>
      <span class="text-5xl font-bold">{{ char }}</span>
    </template>
    <p class="text-lg">{{ note.meanings.join('; ') }}</p>
    <KanjiNoteSection :char="char" :note="note" :others="note.words" :is-heading-shown="false" />
  </CardBackPanel>
</template>
