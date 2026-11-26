<script setup lang="ts">
/**
 * The small button that folds a panel down to its headline and opens it
 * again: ▲ folds, ▼ opens. A PixelButton, so it clicks like every other
 * button. Used by the start screen's leaderboard and streak panels.
 */
import PixelButton from './PixelButton.vue';

defineProps<{ isFolded: boolean; label: string }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <PixelButton
    colour="steel"
    class="min-h-9 min-w-9 px-2 text-sm"
    :aria-expanded="!isFolded"
    :aria-label="isFolded ? `Show the ${label}` : `Hide the ${label}`"
    data-testid="fold-button"
    @click="$emit('toggle')"
  >
    {{ isFolded ? '▼' : '▲' }}
  </PixelButton>
</template>
