<script setup lang="ts">
/**
 * Today's review progress (L10) and how many items are known (R7): words
 * in word mode, grammar points in Bunpou (D57). Word mode also shows days
 * played this week (L12): days played, not a streak, so missing a day
 * costs nothing.
 */
import { CALENDAR_DAYS } from '../../memory/review-engine.ts';
import { computed } from 'vue';
import type { DailyProgress } from '../../memory/daily-deck.ts';

const props = defineProps<{
  daily: DailyProgress;
  /** What's counted, as the label says it: "Words known", "Grammar known". */
  knownLabel: string;
  known: number;
  total: number;
  level: string;
  daysPlayedThisWeek?: number;
}>();

const share = computed(() => (props.daily.total === 0 ? 1 : props.daily.done / props.daily.total));
</script>

<template>
  <section class="pixel-panel space-y-1 bg-wood/80 p-3 text-sm text-washi/80" aria-label="Today">
    <p class="flex flex-wrap justify-between gap-x-2">
      <span v-if="daily.isCleared" class="font-semibold whitespace-nowrap text-aqua"
        >Today's reviews cleared ✓</span
      >
      <span v-else class="whitespace-nowrap">Today {{ daily.done }} / {{ daily.total }}</span>
      <span class="whitespace-nowrap"
        >{{ knownLabel }} {{ known }} / {{ total }} ({{ level }})</span
      >
    </p>
    <div class="h-1.5 overflow-hidden bg-lacquer" aria-hidden="true">
      <div class="h-full bg-aqua" :style="{ width: `${share * 100}%` }" />
    </div>
    <p v-if="daysPlayedThisWeek !== undefined" class="text-xs text-washi/60">
      Played {{ daysPlayedThisWeek }} of the last {{ CALENDAR_DAYS }} days
    </p>
  </section>
</template>
