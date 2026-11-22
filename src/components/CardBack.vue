<script setup lang="ts">
/**
 * A word card's back, shown while paused (L9, D29): its reading, meanings,
 * an example, and each kanji with all its readings. The readings this word
 * uses are highlighted, next to other words that use the same kanji.
 */
import { computed } from 'vue';
import { isKanji, REPEAT_MARK } from '../deck/kana.ts';
import type { DeckWord, KanjiNote } from '../deck/types.ts';
import FuriganaText from './FuriganaText.vue';

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
  <article
    class="max-h-[70vh] space-y-4 overflow-y-auto rounded-2xl washi border-2 border-crimson/60 p-4 text-sumi shadow-xl"
    aria-label="Card back"
  >
    <header class="flex items-baseline justify-between gap-3">
      <p lang="ja">
        <span class="font-card text-3xl font-bold">{{ word.word }}</span>
        <span class="ml-2 text-xl">{{ word.reading }}</span>
      </p>
      <button
        type="button"
        class="rounded-lg bg-steel px-3 py-1 text-sm text-washi"
        @click="$emit('close')"
      >
        Turn over
      </button>
    </header>
    <p class="text-lg">{{ word.meanings.join('; ') }}</p>
    <section v-if="word.example" class="rounded-xl bg-white/50 p-3">
      <p class="text-lg leading-loose"><FuriganaText :marked="word.example.text" /></p>
      <p class="text-sm text-sumi/70">{{ word.example.english }}</p>
      <a
        class="text-xs text-sumi/60 underline"
        :href="`https://tatoeba.org/sentences/show/${word.example.tatoebaId}`"
        >Tatoeba #{{ word.example.tatoebaId }}</a
      >
    </section>
    <section v-for="item in kanjiInWord" :key="item.char" class="border-t border-sumi/15 pt-3">
      <p class="flex items-baseline gap-3">
        <span class="font-card text-3xl" lang="ja">{{ item.char }}</span>
        <span class="text-sm text-sumi/70">{{ item.note.meanings.slice(0, 3).join(', ') }}</span>
      </p>
      <p class="mt-1 flex flex-wrap gap-1.5" lang="ja">
        <span
          v-for="reading in [...item.note.onyomi, ...item.note.kunyomi]"
          :key="reading"
          class="rounded px-1.5 py-0.5 text-sm"
          :class="
            item.used.includes(reading) ? 'bg-crimson font-semibold text-washi' : 'bg-washi-shade'
          "
          >{{ reading }}</span
        >
      </p>
      <p v-if="item.others.length" class="mt-1 text-sm text-sumi/70" lang="ja">
        <span v-for="other in item.others" :key="other.word" class="mr-3"
          >{{ other.word }} {{ other.reading }}</span
        >
      </p>
    </section>
  </article>
</template>
