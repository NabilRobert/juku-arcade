<script setup lang="ts">
/**
 * The logo (D40): 塾 (juku, a cram school, the game's name) in red inside a
 * red pixel ring on white, like a hanko seal. It sizes itself to its box:
 * the parent sets the width, and the seal stays round.
 *
 * A scouted crest (D42) uses the same seal with its own symbol and colour.
 */
import { DECK_MARK } from './deck-mark.ts';
import { SEAL_DISC, SEAL_GRID, SEAL_RING } from './pixel-seal.ts';

withDefaults(defineProps<{ mark?: string; ink?: string; label?: string }>(), {
  mark: DECK_MARK,
  ink: 'var(--color-crimson)',
  label: `${DECK_MARK} (juku)`,
});

/** The kanji's size on the seal's grid: a little over half the seal, as on a hanko. */
const KANJI_SIZE = 12;
</script>

<template>
  <span
    class="relative inline-block aspect-square drop-shadow-[0_2px_0_rgb(0_0_0/0.45)]"
    role="img"
    :aria-label="label"
  >
    <svg
      class="block size-full"
      :viewBox="`0 0 ${SEAL_GRID} ${SEAL_GRID}`"
      shape-rendering="crispEdges"
      aria-hidden="true"
    >
      <path :d="SEAL_DISC" fill="var(--color-washi)" />
      <path :d="SEAL_RING" :fill="ink" />
      <!-- Centred on the middle of its em box, so the font's line spacing can't push it off. -->
      <text
        :x="SEAL_GRID / 2"
        :y="SEAL_GRID / 2"
        text-anchor="middle"
        dominant-baseline="central"
        :font-size="KANJI_SIZE"
        :fill="ink"
        font-family="'Kuronuri 70', sans-serif"
        lang="ja"
      >
        {{ mark }}
      </text>
    </svg>
  </span>
</template>
