<script setup lang="ts">
/**
 * The button that folds a panel down to its headline (Hide) and opens it
 * again (Show). It's the leaderboard's Back and Next button
 * (ArcadeButton.vue), so the start screen's buttons match (playtest
 * decision, 2026-11-26). Used by the leaderboard and streak panels.
 */
import ArcadeButton from './ArcadeButton.vue';

defineProps<{ isFolded: boolean; label: string }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <ArcadeButton
    :aria-expanded="!isFolded"
    :aria-label="isFolded ? `Show the ${label}` : `Hide the ${label}`"
    data-testid="fold-button"
    @click="$emit('toggle')"
  >
    {{ isFolded ? 'Show' : 'Hide' }}
  </ArcadeButton>
</template>
