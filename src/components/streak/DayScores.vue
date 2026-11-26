<script setup lang="ts">
/** A day's highest score in each mode played, beside that mode's best that month and ever. */
import type { ModeScores } from '../../memory/day-summary.ts';
import { modeName } from '../../memory/play-log.ts';

defineProps<{ scores: readonly ModeScores[]; isToday: boolean }>();
</script>

<template>
  <table class="w-full text-left">
    <thead class="text-xs text-washi/60">
      <tr>
        <th class="font-normal">{{ $t('streak.scores.highest') }}</th>
        <th class="font-normal">
          {{ isToday ? $t('streak.scores.today') : $t('streak.scores.thatDay') }}
        </th>
        <th class="font-normal">{{ $t('streak.scores.thisMonth') }}</th>
        <th class="font-normal">{{ $t('streak.scores.ever') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in scores" :key="row.mode" :data-mode="row.mode">
        <td>{{ modeName(row.mode) }}</td>
        <td class="font-bold text-lamp">{{ row.dayBest }}</td>
        <td>{{ row.monthBest }}</td>
        <td>{{ row.everBest }}</td>
      </tr>
    </tbody>
  </table>
</template>
