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

/** What's counted: words in word mode, grammar points in Bunpou. Each has its own whole message. */
const KNOWN_MESSAGES = {
  words: 'game.daily.wordsKnown',
  grammar: 'game.daily.grammarKnown',
} as const;

const props = defineProps<{
  daily: DailyProgress;
  counted: keyof typeof KNOWN_MESSAGES;
  known: number;
  total: number;
  level: string;
  daysPlayedThisWeek?: number;
}>();

const share = computed(() => (props.daily.total === 0 ? 1 : props.daily.done / props.daily.total));
</script>

<template>
  <section
    class="pixel-panel space-y-1 bg-wood/80 p-3 text-sm text-washi/80"
    :aria-label="$t('game.daily.label')"
  >
    <p class="flex flex-wrap justify-between gap-x-2">
      <span v-if="daily.isCleared" class="font-semibold whitespace-nowrap text-aqua">{{
        $t('game.daily.cleared')
      }}</span>
      <span v-else class="whitespace-nowrap">{{
        $t('game.daily.progress', { done: daily.done, total: daily.total })
      }}</span>
      <span class="whitespace-nowrap">{{
        $t(KNOWN_MESSAGES[counted], { known, total, level })
      }}</span>
    </p>
    <div class="h-1.5 overflow-hidden bg-lacquer" aria-hidden="true">
      <div class="h-full bg-aqua" :style="{ width: `${share * 100}%` }" />
    </div>
    <p v-if="daysPlayedThisWeek !== undefined" class="text-xs text-washi/60">
      {{ $t('game.daily.daysPlayed', { days: daysPlayedThisWeek, calendarDays: CALENDAR_DAYS }) }}
    </p>
  </section>
</template>
