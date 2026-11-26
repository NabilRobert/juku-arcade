<script setup lang="ts">
/**
 * Bunpou's results, when the player ends the run (D57; the player ends a
 * run, the plan says): the score, the best combo, the lines right, and the
 * grammar reviews so far (points seen and known, today's progress), with
 * your best run and its place on the Bunpou leaderboard (D59; ★ when this
 * run is the new best). The curtain call and haiku come before it.
 */
import { CORRECT_DAYS_TO_KNOW } from '../../memory/leitner.ts';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

const panels = computed(() => [
  { id: 'score', label: t('bunpou.score'), value: String(props.score) },
  {
    id: 'best-run',
    label: t('bunpou.results.bestRun'),
    value: props.isNewBest ? `${props.best} ★` : String(props.best),
  },
  { id: 'board-rank', label: t('bunpou.results.boardRank'), value: `#${props.rank}` },
  { id: 'best-combo', label: t('bunpou.results.bestCombo'), value: String(props.bestCombo) },
  {
    id: 'lines-right',
    label: t('bunpou.results.linesRight'),
    value: `${props.lines.right} / ${props.lines.played}`,
  },
  {
    id: 'grammar-seen',
    label: t('bunpou.results.grammarSeen'),
    value: `${props.progress.pointsSeen} / ${props.progress.pointCount}`,
  },
  {
    id: 'grammar-known',
    label: t('bunpou.grammarKnown'),
    value: `${props.progress.pointsKnown} / ${props.progress.pointCount}`,
  },
  {
    id: 'today',
    label: t('bunpou.results.today'),
    value: props.progress.daily.isCleared
      ? t('bunpou.results.cleared')
      : `${props.progress.daily.done} / ${props.progress.daily.total}`,
  },
]);
</script>

<template>
  <RunResults
    :title="t('bunpou.results.title')"
    :panels="panels"
    :note="t('bunpou.results.note', { days: CORRECT_DAYS_TO_KNOW })"
    :again-label="t('bunpou.results.playAgain')"
    @again="$emit('again')"
    @leave="$emit('leave')"
  />
</template>
