<script setup lang="ts">
/**
 * Scouting in kanji mode (D42), in the side panel: the Scout button, how
 * many scouts are left, and the last crest that paid out or cost points,
 * floating away. Scouting flips the hand over to show the crests; the
 * button turns red while it's flipped and turns the hand back.
 */
import { m } from 'motion-v';
import { KANJI_CREST_EFFECTS } from '../kanji/kanji-crests.ts';
import { CRESTS } from '../roguelike/specials.ts';
import PixelButton from './PixelButton.vue';

defineProps<{
  scoutsLeft: number;
  isScouting: boolean;
  canScout: boolean;
  news: { text: string; isGood: boolean; key: number } | null;
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
      <template v-else>🔍 Scout · {{ scoutsLeft }} left</template>
    </PixelButton>
    <p class="text-xs text-washi/60">A perfect round earns a scout.</p>
    <m.p
      v-if="news"
      :key="news.key"
      class="pointer-events-none absolute inset-x-0 top-full font-bold drop-shadow-[0_0_6px_rgb(241_250_238/0.9)]"
      :class="news.isGood ? 'text-aqua' : 'text-crimson'"
      :initial="{ y: 0, opacity: 1 }"
      :animate="{ y: 24, opacity: 0 }"
      :transition="{ duration: 1.4, ease: 'easeIn' }"
      data-testid="crest-news"
    >
      {{ news.text }}
    </m.p>
  </section>
</template>
