<script setup lang="ts">
/**
 * A word card's back, shown while paused (L9, D29): its reading, meanings,
 * an example, and each kanji with all its readings. The readings this word
 * uses are highlighted, next to other words that use the same kanji. The
 * panel and each kanji's notes are shared with a kanji's own back
 * (CardBackPanel.vue, KanjiNoteSection.vue).
 */
import { computed } from 'vue';
import { isKanji, REPEAT_MARK } from '../../deck/kana.ts';
import type { DeckWord, KanjiNote } from '../../deck/types.ts';
import CardBackPanel from './CardBackPanel.vue';
import FuriganaText from './FuriganaText.vue';
import KanjiNoteSection from './KanjiNoteSection.vue';

const props = defineProps<{ word: DeckWord; kanji: Readonly<Record<string, KanjiNote>> }>();
defineEmits<{ close: [] }>();

/** Other words per kanji: enough to show its other readings without crowding the card. */
const OTHER_WORDS_SHOWN = 3;

const kanjiInWord = computed(() =>
  [
    ...new Set([...props.word.word].filter((char) => isKanji(char) && char !== REPEAT_MARK)),
  ].flatMap((char) => {
    const note = props.kanji[char];
    if (note === undefined) return [];
    const used = props.word.kanjiReadingsUsed[char] ?? [];
    const others = note.words
      .filter((other) => other.word !== props.word.word)
      .slice(0, OTHER_WORDS_SHOWN);
    return [{ char, note, used, others }];
  }),
);
</script>

<template>
  <CardBackPanel @close="$emit('close')">
    <template #title>
      <span class="text-3xl font-bold">{{ word.word }}</span>
      <span class="ml-2 text-xl">{{ word.reading }}</span>
    </template>
    <p class="text-lg">{{ word.meanings.join('; ') }}</p>
    <section v-if="word.example" class="pixel-panel bg-white/50 p-3">
      <p class="text-lg leading-loose"><FuriganaText :marked="word.example.text" /></p>
      <p class="text-sm text-sumi/70">{{ word.example.english }}</p>
      <a
        class="text-xs text-sumi/60 underline"
        :href="`https://tatoeba.org/sentences/show/${word.example.tatoebaId}`"
        >Tatoeba #{{ word.example.tatoebaId }}</a
      >
    </section>
    <KanjiNoteSection
      v-for="item in kanjiInWord"
      :key="item.char"
      :char="item.char"
      :note="item.note"
      :used="item.used"
      :others="item.others"
    />
  </CardBackPanel>
</template>
