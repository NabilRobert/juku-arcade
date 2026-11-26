<script setup lang="ts">
/**
 * The pause button on a phone or a tablet: at the top right of the page,
 * in the title's row, rather than in the folded-away side panel (playtest
 * decision, 2026-11-26). It's placed on the page, not the screen, so it
 * never sits over the board or the timer, even when the page scrolls. Wide screens keep each mode's own
 * pause button, so this one hides there.
 */
import PixelButton from './PixelButton.vue';

defineProps<{ isPaused: boolean; isDisabled?: boolean }>();
defineEmits<{ pause: []; resume: [] }>();
</script>

<template>
  <PixelButton
    :colour="isPaused ? 'crimson' : 'steel'"
    class="absolute top-3 right-3 z-30 min-h-11 px-4 text-sm font-semibold disabled:opacity-50 lg:hidden"
    :disabled="isDisabled"
    :aria-pressed="isPaused"
    data-testid="floating-pause"
    @click="isPaused ? $emit('resume') : $emit('pause')"
  >
    {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
  </PixelButton>
</template>
