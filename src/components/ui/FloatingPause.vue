<script setup lang="ts">
/**
 * The pause button on a phone or a tablet: at the top right of the page,
 * in the title's row, rather than in the folded-away side panel (playtest
 * decision, 2026-11-26). It's placed on the page, not the screen, so it
 * never sits over the board or the timer, even when the page scrolls. Wide screens keep each mode's own
 * pause button, so this one hides there.
 */
import PauseButton from './PauseButton.vue';

defineProps<{ isPaused: boolean; isDisabled?: boolean }>();
defineEmits<{ pause: []; resume: [] }>();
</script>

<template>
  <PauseButton
    class="absolute top-3 right-3 z-30 lg:hidden"
    :is-paused="isPaused"
    :is-disabled="isDisabled"
    data-testid="floating-pause"
    @pause="$emit('pause')"
    @resume="$emit('resume')"
  />
</template>
