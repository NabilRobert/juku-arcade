<script setup lang="ts">
/**
 * The results card a run ends on, in any mode: a title, the run's numbers
 * as labelled panels, how it compares with the best (a new best, or how
 * close it came), an optional note, anything else the mode adds (the
 * slot: the dojo's quote), and two buttons (go again, and leave for the
 * start screen). Bunpou's results, word mode's finished deck, kanji mode's
 * sheet and the dojo's game over all use it.
 */
import { computed } from 'vue';
import { bestComparison } from '../../memory/best-comparison.ts';
import PixelButton from './PixelButton.vue';
import StatPanel from './StatPanel.vue';

export interface ResultPanel {
  label: string;
  value: string;
}

const props = defineProps<{
  title: string;
  panels: readonly ResultPanel[];
  note?: string;
  againLabel: string;
  leaveLabel?: string;
  /** The run's score and the best before it, to say how close it came. */
  comparison?: { score: number; previousBest: number };
}>();

const comparisonText = computed(() =>
  props.comparison ? bestComparison(props.comparison.score, props.comparison.previousBest) : '',
);
defineEmits<{ again: []; leave: [] }>();
</script>

<template>
  <section
    class="pixel-panel flex flex-col gap-5 bg-wood/80 p-6"
    aria-label="Run results"
    data-testid="results"
  >
    <h2 class="text-2xl font-bold text-aqua">{{ title }}</h2>
    <p v-if="comparisonText" class="text-lg font-bold text-lamp" data-testid="best-comparison">
      {{ comparisonText }}
    </p>
    <div class="grid grid-cols-4 gap-3">
      <StatPanel v-for="panel in panels" :key="panel.label" :label="panel.label">
        <span class="text-2xl font-bold" :data-testid="`result-${panel.label}`">{{
          panel.value
        }}</span>
      </StatPanel>
    </div>
    <p v-if="note" class="text-sm text-washi/70">{{ note }}</p>
    <slot />
    <div class="flex justify-end gap-3">
      <PixelButton colour="steel" class="px-6 py-2" data-testid="leave" @click="$emit('leave')">{{
        leaveLabel ?? 'Change mode'
      }}</PixelButton>
      <PixelButton
        colour="aqua"
        class="px-6 py-2 font-bold"
        data-testid="play-again"
        @click="$emit('again')"
      >
        {{ againLabel }} ▶
      </PixelButton>
    </div>
  </section>
</template>
