<script setup lang="ts">
/**
 * The results card a run ends on, in any mode: a title, the run's numbers
 * as labelled panels, an optional note, anything else the mode adds (the
 * slot: the dojo's quote), and two buttons (go again, and leave for the
 * start screen). Bunpou's results, word mode's finished deck, kanji mode's
 * sheet and the dojo's game over all use it.
 */
import PixelButton from './PixelButton.vue';
import StatPanel from './StatPanel.vue';

export interface ResultPanel {
  label: string;
  value: string;
}

defineProps<{
  title: string;
  panels: readonly ResultPanel[];
  note?: string;
  againLabel: string;
  leaveLabel?: string;
}>();
defineEmits<{ again: []; leave: [] }>();
</script>

<template>
  <section
    class="pixel-panel flex flex-col gap-5 bg-wood/80 p-6"
    aria-label="Run results"
    data-testid="results"
  >
    <h2 class="text-2xl font-bold text-aqua">{{ title }}</h2>
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
