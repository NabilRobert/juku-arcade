<script setup lang="ts">
/**
 * The button that folds a panel down to its headline (Hide) and opens it
 * again (Show). It's the leaderboard's Back and Next button
 * (ArcadeButton.vue), so the start screen's buttons match (playtest
 * decision, 2026-11-26). Used by the leaderboard and streak panels.
 */
import ArcadeButton from './ArcadeButton.vue';

/** `label` is the panel's name, already in the interface language, put into "Show the …". */
defineProps<{ isFolded: boolean; label: string }>();
defineEmits<{ toggle: [] }>();
</script>

<template>
  <ArcadeButton
    :aria-expanded="!isFolded"
    :aria-label="
      isFolded
        ? $t('menu.fold.showPanel', { panel: label })
        : $t('menu.fold.hidePanel', { panel: label })
    "
    data-testid="fold-button"
    @click="$emit('toggle')"
  >
    {{ isFolded ? $t('menu.fold.show') : $t('menu.fold.hide') }}
  </ArcadeButton>
</template>
