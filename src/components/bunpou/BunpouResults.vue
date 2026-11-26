<script setup lang="ts">
/**
 * Bunpou's results, when the player ends the run (D57; the player ends a
 * run, the plan says): the score, the best combo, the lines right, and the
 * grammar reviews so far (points seen and known, today's progress), with
 * your best run and its place on the Bunpou leaderboard (D59; ★ when this
 * run is the new best). The curtain call and haiku come before it.
 */
import { computed } from 'vue';
import type { GrammarProgress } from '../../grammar/grammar-reviews.ts';
import RunResults from '../ui/RunResults.vue';

const props = defineProps<{
  score: number;
  bestCombo: number;
  lines: { played: number; right: number };
  progress: GrammarProgress;
  /** Your best run in this browser, and its place on the Bunpou leaderboard. */
  best: number;
  isNewBest: boolean;
  rank: number;
}>();
defineEmits<{ again: []; leave: [] }>();

const panels = computed(() => [
  { label: 'Score', value: String(props.score) },
  { label: 'Best run', value: props.isNewBest ? `${props.best} ★` : String(props.best) },
  { label: 'Board rank', value: `#${props.rank}` },
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
  <RunResults
    title="Run results"
    :panels="panels"
    note="A grammar point is known once you build it right on two separate days. Points you miss come back sooner."
    again-label="Play again"
    @again="$emit('again')"
    @leave="$emit('leave')"
  />
</template>
