<script setup lang="ts">
/**
 * The stats page's grammar section (memory/grammar-stats.ts): grammar
 * known, sentences right today and overall, the points missed most (by
 * their pattern, in Japanese with furigana) and the kinds of mistake.
 */
import { computed } from 'vue';
import { CURRICULUM } from '../grammar/curriculum.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import { createGrammarReviews } from '../grammar/grammar-reviews.ts';
import { POINT_PATTERNS, type PointId } from '../grammar/templates.ts';
import { grammarStats } from '../memory/grammar-stats.ts';
import { percentRight } from '../memory/stats.ts';
import FuriganaText from './words/FuriganaText.vue';
import RankedList from './ui/RankedList.vue';
import StatPanel from './ui/StatPanel.vue';

const props = defineProps<{ events: readonly GrammarEvent[]; today: string }>();

const stats = computed(() => grammarStats(props.events, props.today));
const progress = computed(() =>
  createGrammarReviews(CURRICULUM, props.events).progress(props.today),
);
const missed = computed(() =>
  stats.value.mostMissed.map(({ pointId, misses }) => ({ key: pointId, count: misses })),
);
const mistakes = computed(() =>
  stats.value.mistakes.map(({ name, count }) => ({ key: name, count })),
);

const tiles = computed(() => [
  { label: 'Grammar known', value: `${progress.value.pointsKnown} / ${progress.value.pointCount}` },
  {
    label: 'Right today',
    value: percentRight(stats.value.today),
    note: `${stats.value.today.right} right`,
  },
  {
    label: 'Right overall',
    value: percentRight(stats.value.allTime),
    note: `${stats.value.allTime.right} right`,
  },
  { label: 'Grammar seen', value: `${progress.value.pointsSeen} / ${progress.value.pointCount}` },
]);

const patternOf = (pointId: string): string => POINT_PATTERNS[pointId as PointId] ?? pointId;
</script>

<template>
  <section class="space-y-3" aria-label="Grammar" data-testid="grammar-stats">
    <h3 class="text-lg font-semibold">Grammar</h3>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatPanel v-for="tile in tiles" :key="tile.label" :label="tile.label" :note="tile.note">
        <span class="block text-2xl font-bold">{{ tile.value }}</span>
      </StatPanel>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <RankedList title="Grammar missed most" :items="missed" empty-text="No misses yet." unit="×">
        <template #default="{ item }">
          <span lang="ja"><FuriganaText :marked="patternOf(item.key)" is-reading-below /></span>
        </template>
      </RankedList>
      <RankedList
        title="Grammar mistakes by kind"
        :items="mistakes"
        empty-text="No mistakes yet."
      />
    </div>
  </section>
</template>
