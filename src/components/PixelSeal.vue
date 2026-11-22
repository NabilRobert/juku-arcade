<script setup lang="ts">
/**
 * The logo (D40): 塾 (juku, a cram school, the game's name) in red inside a
 * red pixel ring on white, like a hanko seal. It sizes itself to its box:
 * the parent sets the width, and the seal stays round.
 */
import { DECK_MARK } from './deck-mark.ts';
import { SEAL_DISC, SEAL_GRID, SEAL_RING } from './pixel-seal.ts';
</script>

<template>
  <span
    class="@container relative inline-flex aspect-square items-center justify-center drop-shadow-[0_2px_0_rgb(0_0_0/0.45)]"
    role="img"
    :aria-label="`${DECK_MARK} (juku)`"
  >
    <svg
      class="absolute inset-0 size-full"
      :viewBox="`0 0 ${SEAL_GRID} ${SEAL_GRID}`"
      shape-rendering="crispEdges"
      aria-hidden="true"
    >
      <path :d="SEAL_DISC" fill="var(--color-washi)" />
      <path :d="SEAL_RING" fill="var(--color-crimson)" />
    </svg>
    <span
      class="relative font-card text-[56cqw] leading-none text-crimson"
      lang="ja"
      aria-hidden="true"
      >{{ DECK_MARK }}</span
    >
  </span>
</template>
