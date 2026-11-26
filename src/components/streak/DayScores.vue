<script setup lang="ts">
/** A day's highest score in each mode played, beside that mode's best that month and ever. */
import type { ModeScores } from '../../memory/day-summary.ts';
import type { PlayMode } from '../../memory/play-log.ts';

defineProps<{ scores: readonly ModeScores[] }>();

const MODE_NAMES: Record<PlayMode, string> = { words: 'Words', kanji: 'Kanji', bunpou: 'Bunpou' };
</script>

<template>
  <table class="w-full text-left">
    <thead class="text-xs text-washi/60">
      <tr>
        <th class="font-normal">Highest score</th>
        <th class="font-normal">That day</th>
        <th class="font-normal">This month</th>
        <th class="font-normal">Ever</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in scores" :key="row.mode" :data-mode="row.mode">
        <td>{{ MODE_NAMES[row.mode] }}</td>
        <td class="font-bold text-lamp">{{ row.dayBest }}</td>
        <td>{{ row.monthBest }}</td>
        <td>{{ row.everBest }}</td>
      </tr>
    </tbody>
  </table>
</template>
