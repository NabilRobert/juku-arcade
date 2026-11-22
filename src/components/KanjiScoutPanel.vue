<script setup lang="ts">
/**
 * Scouting in kanji mode (D42), in the side panel: the Scout button, how
 * many scouts are left, and the last crest that paid out or cost points,
 * floating away. Scouting flips the hand over to show the crests; the
 * button turns red while it's flipped and turns the hand back.
 */
import { KANJI_CREST_EFFECTS } from '../kanji/kanji-crests.ts';
import { CRESTS } from '../roguelike/specials.ts';
import type { Notice } from '../composables/useNotice.ts';
import FloatingNotice from './FloatingNotice.vue';
import PixelButton from './PixelButton.vue';
import PixelIcon from './PixelIcon.vue';

defineProps<{
  scoutsLeft: number;
  isScouting: boolean;
  canScout: boolean;
  notice: Notice | null;
}>();
defineEmits<{ scout: [] }>();

/** What each crest does, for the Scout button's tooltip. */
const crestGuide = Object.values(CRESTS)
  .map((crest) => `${crest.symbol} ${crest.name}: ${KANJI_CREST_EFFECTS[crest.kind]}`)
  .join('\n');
</script>

<template>
  <section class="pixel-panel relative flex flex-col gap-2 bg-wood/80 p-3 text-center">
    <PixelButton
      :colour="isScouting ? 'crimson' : 'steel'"
      class="min-h-9 px-4 text-sm disabled:opacity-40"
      :disabled="!isScouting && (!canScout || scoutsLeft === 0)"
      :title="crestGuide"
      data-testid="scout"
      @click="$emit('scout')"
    >
      <template v-if="isScouting">↩ Turn back</template>
      <span v-else class="inline-flex items-center gap-2">
        <PixelIcon name="scout" /> Scout · {{ scoutsLeft }} left
      </span>
    </PixelButton>
    <p class="text-xs text-washi/60">A perfect round earns a scout.</p>
    <FloatingNotice :notice="notice" />
  </section>
</template>
