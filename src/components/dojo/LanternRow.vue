<script setup lang="ts">
/**
 * The dojo's lives as a row of lanterns (lantern-sprite.ts): the ones
 * still lit glow, the ones a miss has put out are dim. Screen readers
 * hear the count instead.
 */
import PixelSprite from '../ui/PixelSprite.vue';
import { DIM_PALETTE, LANTERN_GRID, LIT_PALETTE } from './lantern-sprite.ts';

defineProps<{ lit: number; total: number }>();
</script>

<template>
  <div class="flex justify-center gap-3" role="img" :aria-label="`${lit} of ${total} lanterns lit`">
    <PixelSprite
      v-for="index in total"
      :key="index"
      class="h-14"
      :class="index <= lit ? 'drop-shadow-[0_0_6px_#f4c86a]' : ''"
      :grid="LANTERN_GRID"
      :palette="index <= lit ? LIT_PALETTE : DIM_PALETTE"
      :name="index <= lit ? 'lantern-lit' : 'lantern-dim'"
      :data-lit="index <= lit"
    />
  </div>
</template>
