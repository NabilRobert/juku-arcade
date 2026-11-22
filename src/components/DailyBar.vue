<script setup lang="ts">
/**
 * Today's deck progress (L10), words known (R7) and days played this week
 * (L12). Days played, not a streak, so missing a day costs nothing.
 */
import { computed } from 'vue';
import type { Progress } from '../memory/review-engine.ts';

const props = defineProps<{ progress: Progress; level: string }>();

const share = computed(() =>
  props.progress.daily.total === 0 ? 1 : props.progress.daily.done / props.progress.daily.total,
);
</script>

<template>
  <section class="pixel-panel space-y-1 bg-wood/80 p-3 text-sm text-washi/80" aria-label="Today">
    <p class="flex justify-between">
      <span v-if="progress.daily.isCleared" class="font-semibold text-aqua"
        >Today's deck cleared ✓</span
      >
      <span v-else>Today {{ progress.daily.done }} / {{ progress.daily.total }}</span>
      <span>Words known {{ progress.wordsKnown }} / {{ progress.deckSize }} ({{ level }})</span>
    </p>
    <div class="h-1.5 overflow-hidden bg-lacquer" aria-hidden="true">
      <div class="h-full bg-aqua" :style="{ width: `${share * 100}%` }" />
    </div>
    <p class="text-xs text-washi/60">Played {{ progress.daysPlayedThisWeek }} of the last 7 days</p>
  </section>
</template>
