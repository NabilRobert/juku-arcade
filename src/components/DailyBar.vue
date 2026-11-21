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
  <section class="space-y-1 text-sm text-slate-300" aria-label="Today">
    <p class="flex justify-between">
      <span v-if="progress.daily.isCleared" class="font-semibold text-emerald-300"
        >Today's deck cleared ✓</span
      >
      <span v-else>Today {{ progress.daily.done }} / {{ progress.daily.total }}</span>
      <span>Words known {{ progress.wordsKnown }} / {{ progress.deckSize }} ({{ level }})</span>
    </p>
    <div class="h-1.5 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
      <div class="h-full rounded-full bg-amber-400" :style="{ width: `${share * 100}%` }" />
    </div>
    <p class="text-xs text-slate-400">
      Played {{ progress.daysPlayedThisWeek }} of the last 7 days
    </p>
  </section>
</template>
