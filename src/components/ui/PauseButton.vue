<script setup lang="ts">
/**
 * Every mode's Pause/Resume button: steel while playing, crimson while
 * paused, with the Esc key hint where there's a keyboard (usePauseKey.ts).
 * The modes place it (beside the board, in the side panel, or floating on
 * a phone, FloatingPause.vue); classes and attributes pass through.
 */
import PixelButton from './PixelButton.vue';

defineProps<{ isPaused: boolean; isDisabled?: boolean }>();
defineEmits<{ pause: []; resume: [] }>();
</script>

<template>
  <PixelButton
    :colour="isPaused ? 'crimson' : 'steel'"
    class="min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
    :disabled="isDisabled"
    :aria-pressed="isPaused"
    @click="isPaused ? $emit('resume') : $emit('pause')"
  >
    {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
    <span class="ml-1 text-xs max-lg:hidden" aria-hidden="true">Esc</span>
  </PixelButton>
</template>
