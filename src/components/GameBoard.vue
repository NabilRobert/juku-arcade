<script setup lang="ts">
/**
 * The board for one set: the word cards on top, the reading cards below
 * (L1). Slice 0 only shows a dealt set; matching arrives in slice 1.
 */
import type { DealtSet } from '../game/deal.ts';
import PlayCard from './PlayCard.vue';

defineProps<{ set: DealtSet }>();
</script>

<template>
  <section class="flex flex-col gap-6" aria-label="Board">
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-5" data-testid="word-row">
      <PlayCard v-for="word in set.words" :key="word.id" :text="word.word" kind="word" />
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="reading-row">
      <PlayCard v-for="card in set.readings" :key="card.text" :text="card.text" kind="reading" />
    </div>
  </section>
</template>
