<script setup lang="ts">
/**
 * Bunpou's results, when the player ends the run (D57; the player ends a
 * run, the plan says): the score, the best combo, the lines right, and the
 * grammar reviews so far (points seen and known, today's progress). The
 * haiku card that closes the show and the leaderboard come in G4.
 */
import { computed } from 'vue';
import type { GrammarProgress } from '../../grammar/grammar-reviews.ts';
import PixelButton from '../ui/PixelButton.vue';
import StatPanel from '../ui/StatPanel.vue';

const props = defineProps<{
  score: number;
  bestCombo: number;
  lines: { played: number; right: number };
  progress: GrammarProgress;
}>();
defineEmits<{ again: []; leave: [] }>();

const panels = computed(() => [
  { label: 'Score', value: String(props.score) },
  { label: 'Best combo', value: String(props.bestCombo) },
  { label: 'Lines right', value: `${props.lines.right} / ${props.lines.played}` },
  {
    label: 'Grammar seen',
    value: `${props.progress.pointsSeen} / ${props.progress.pointCount}`,
  },
  {
    label: 'Grammar known',
    value: `${props.progress.pointsKnown} / ${props.progress.pointCount}`,
  },
  {
    label: 'Today',
    value: props.progress.daily.isCleared
      ? 'Cleared ✓'
      : `${props.progress.daily.done} / ${props.progress.daily.total}`,
  },
]);
</script>

<template>
  <section
    class="pixel-panel flex flex-col gap-5 bg-wood/80 p-6"
    aria-label="Run results"
    data-testid="results"
  >
    <h2 class="text-2xl font-bold text-aqua">Run results</h2>
    <div class="grid grid-cols-3 gap-3">
      <StatPanel v-for="panel in panels" :key="panel.label" :label="panel.label">
        <span class="text-2xl font-bold" :data-testid="`result-${panel.label}`">{{
          panel.value
        }}</span>
      </StatPanel>
    </div>
    <p class="text-sm text-washi/70">
      A grammar point is known once you build it right on two separate days. Points you miss come
      back sooner.
    </p>
    <div class="flex justify-end gap-3">
      <PixelButton colour="steel" class="px-6 py-2" @click="$emit('leave')"
        >Change mode</PixelButton
      >
      <PixelButton
        colour="aqua"
        class="px-6 py-2 font-bold"
        data-testid="play-again"
        @click="$emit('again')"
      >
        Play again ▶
      </PixelButton>
    </div>
  </section>
</template>
