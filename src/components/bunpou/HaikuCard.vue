<script setup lang="ts">
/**
 * The haiku that closes the show (D59), on a paper card: its three lines
 * with furigana under the kanji, the poet for a classic, 新しい句！ when
 * it's new to the collection, and how much of the collection the player
 * has. Japanese only, like the rest of the mode's play.
 */
import type { Haiku } from '../../grammar/haiku-bank.ts';
import FuriganaText from '../words/FuriganaText.vue';

defineProps<{ haiku: Haiku; isNew: boolean; collected: number; total: number }>();
</script>

<template>
  <article
    class="pixel-panel washi relative flex flex-col items-center gap-2 px-16 pt-10 pb-6 text-sumi"
    lang="ja"
    aria-label="Haiku"
    data-testid="haiku"
  >
    <p
      v-if="isNew"
      class="absolute top-3 right-3 bg-crimson px-3 py-1 text-sm text-washi"
      data-testid="haiku-new"
    >
      新しい句！
    </p>
    <p v-for="(line, index) in haiku.lines" :key="index" class="text-3xl leading-loose">
      <FuriganaText :marked="line" is-reading-below />
    </p>
    <p v-if="haiku.poet" class="self-end text-lg text-sumi/70">― {{ haiku.poet }}</p>
    <p class="text-sm text-sumi/60" data-testid="haiku-count">句集 {{ collected }} / {{ total }}</p>
  </article>
</template>
