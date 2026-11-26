<script setup lang="ts">
/**
 * A run's lives as a row of lanterns (lantern-sprite.ts), in practice
 * mode and kanji mode: the ones still lit glow, the ones put out are dim.
 * Screen readers hear the count instead. `isCompact` is the small row a
 * phone or a tablet shows above the board, so the lives are in sight
 * without opening the side drawer (playtest decision, 2026-11-26).
 */
import PixelSprite from './PixelSprite.vue';
import { DIM_PALETTE, LANTERN_GRID, LIT_PALETTE } from './lantern-sprite.ts';

defineProps<{ lit: number; total: number; isCompact?: boolean }>();
</script>

<template>
  <div
    class="flex justify-center"
    :class="isCompact ? 'gap-2' : 'gap-3'"
    role="img"
    :aria-label="$t('game.lanternsLit', { lit, total })"
  >
    <PixelSprite
      v-for="index in total"
      :key="index"
      :class="[
        isCompact ? 'h-7' : 'h-14',
        index <= lit ? 'drop-shadow-[0_0_6px_var(--color-lamp)]' : '',
      ]"
      :grid="LANTERN_GRID"
      :palette="index <= lit ? LIT_PALETTE : DIM_PALETTE"
      :name="index <= lit ? 'lantern-lit' : 'lantern-dim'"
      :data-lit="index <= lit"
    />
  </div>
</template>
