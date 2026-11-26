<script setup lang="ts">
/**
 * The haiku a day's Bunpou shows closed on (D59), one small paper card
 * each, so a day with three shows has three. Shown in the play calendar's
 * day summary.
 */
import { computed } from 'vue';
import { HAIKU_BANK } from '../../grammar/haiku-bank.ts';
import FuriganaText from '../words/FuriganaText.vue';

const props = defineProps<{ haikuIds: readonly string[]; isToday: boolean }>();

const haiku = computed(() =>
  props.haikuIds.flatMap((id) => HAIKU_BANK.filter((poem) => poem.id === id)),
);
</script>

<template>
  <section v-if="haiku.length > 0" class="flex flex-col gap-2" data-testid="day-haiku">
    <h4 class="text-sm text-washi/70">
      {{ isToday ? 'Today you got' : 'That day you got' }}
      {{ haiku.length === 1 ? 'this haiku' : `these ${haiku.length} haiku` }}
    </h4>
    <article
      v-for="(poem, index) in haiku"
      :key="index"
      class="pixel-panel washi flex flex-col px-4 py-2 text-sumi"
      lang="ja"
    >
      <p v-for="(line, lineIndex) in poem.lines" :key="lineIndex" class="text-base leading-loose">
        <FuriganaText :marked="line" is-reading-below />
      </p>
      <p v-if="poem.poet" class="self-end text-sm text-sumi/70">― {{ poem.poet }}</p>
    </article>
  </section>
</template>
