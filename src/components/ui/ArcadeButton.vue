<script setup lang="ts">
/**
 * The arcade-style button from the leaderboard: crimson, bold, upper case,
 * dimmed when disabled. Used for the leaderboard's Back and Next and for
 * the start screen's Hide and Show (FoldButton.vue), so they match.
 * Attributes and listeners pass through to the PixelButton underneath.
 */
import PixelButton from './PixelButton.vue';
</script>

<template>
  <PixelButton colour="crimson" class="min-h-10 px-5 font-bold uppercase disabled:opacity-40">
    <slot />
  </PixelButton>
</template>
