<script setup lang="ts">
/**
 * The small button that folds a panel down to its headline and opens it
 * again: ▲ folds, ▼ opens. A PixelButton, so it clicks like every other
 * button. Used by the start screen's leaderboard and streak panels.
 *
 * Aqua, not steel: a steel button vanished into the steel leaderboard, and
 * steel's click wipe is crimson, which on a button this small showed as
 * two red bars at its sides (playtest, 2026-11-26). Aqua's wipe is a pale
 * blink.
 */
import PixelButton from './PixelButton.vue';

defineProps<{ isFolded: boolean; label: string }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <PixelButton
    colour="aqua"
    class="min-h-9 min-w-9 px-2 text-sm"
    :aria-expanded="!isFolded"
    :aria-label="isFolded ? `Show the ${label}` : `Hide the ${label}`"
    data-testid="fold-button"
    @click="$emit('toggle')"
  >
    {{ isFolded ? '▼' : '▲' }}
  </PixelButton>
</template>
