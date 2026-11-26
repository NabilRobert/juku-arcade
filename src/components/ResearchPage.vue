<script setup lang="ts">
/**
 * "The research": the papers and books the game's design rests on
 * (research/sources.ts), grouped by what they support, each with what it
 * found and where the game uses it. Opened from the footer, like "About
 * the data".
 */
import { SOURCE_GROUPS } from '../research/sources.ts';
import BackButton from './ui/BackButton.vue';

defineEmits<{ close: [] }>();
</script>

<template>
  <article class="mx-auto max-w-3xl space-y-6 text-washi/90">
    <header class="space-y-2">
      <h2 class="text-xl font-semibold">The research</h2>
      <p class="text-washi/70">
        The ideas the game is built on, and where they come from. These back the design's ideas;
        none of them studied this game.
      </p>
    </header>
    <section v-for="group in SOURCE_GROUPS" :key="group.heading" class="space-y-3">
      <h3 class="text-lg font-semibold text-aqua">{{ group.heading }}</h3>
      <div
        v-for="source in group.sources"
        :key="source.citation"
        class="pixel-panel space-y-1 bg-wood/80 p-3"
        data-testid="source"
      >
        <p class="font-semibold">
          <a
            v-if="source.url"
            class="underline"
            :href="source.url"
            target="_blank"
            rel="noopener"
            >{{ source.citation }}</a
          >
          <template v-else>{{ source.citation }}</template>
        </p>
        <p class="text-xs text-washi/60">{{ source.venue }}</p>
        <p>{{ source.finding }}</p>
        <p class="text-sm text-lamp">In juku-arcade: {{ source.inGame }}</p>
      </div>
    </section>
    <BackButton @click="$emit('close')" />
  </article>
</template>
