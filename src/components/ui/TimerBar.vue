<script lang="ts">
/** Under this share of the time left, the bar turns crimson as a warning. */
export const LOW_TIME_SHARE = 0.25;
</script>

<script setup lang="ts">
/**
 * Time left as a bar that shrinks from full (1) to empty (0), turning
 * crimson when it's nearly out. One bar for every timed screen: word mode
 * (its panel, and above the board on a phone), Bunpou's line, the word
 * check-up. Screen readers hear it as a progress bar, as `label`.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{ timeLeft: number; label?: string }>(), {
  label: 'Time left',
});

const isLow = computed(() => props.timeLeft < LOW_TIME_SHARE);
</script>

<template>
  <span
    class="pixel-panel block h-3 overflow-hidden bg-lacquer"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(timeLeft * 100)"
    :data-low="isLow ? '' : undefined"
    data-testid="timer"
  >
    <span
      class="block h-full transition-[width] duration-100"
      :class="isLow ? 'bg-crimson' : 'bg-aqua'"
      :style="{ width: `${timeLeft * 100}%` }"
    />
  </span>
</template>
