<script setup lang="ts">
/**
 * The combo, on the table between the two rows of cards, where the player
 * is looking. It pops on every hit and grows and warms as the combo
 * builds: washi white, then gold from 5, then vermilion from 10, with a
 * word of praise at each step. A lost streak drops away in vermilion.
 */
import { m } from 'motion-v';
import { computed } from 'vue';

const props = defineProps<{ combo: number; brokenCombo: number | null }>();
defineEmits<{ brokenShown: [] }>();

/** Below this the combo isn't shown: one match isn't a streak yet. */
const SHOWN_FROM = 2;
/** Each match grows the number by this share, up to MAX_GROWTH. */
const GROWTH_PER_MATCH = 0.04;
const MAX_GROWTH = 0.8;

interface Tier {
  from: number;
  praise: string;
  colour: string;
}

/** Praise in easy Japanese, so even the cheering is reading practice. */
const TIERS: Tier[] = [
  {
    from: 20,
    praise: 'さいこう！',
    colour: 'text-vermilion drop-shadow-[0_0_14px_rgb(195_54_31/0.9)]',
  },
  {
    from: 10,
    praise: 'すごい！',
    colour: 'text-vermilion drop-shadow-[0_0_10px_rgb(201_162_74/0.8)]',
  },
  { from: 5, praise: 'いいね！', colour: 'text-gold drop-shadow-[0_0_8px_rgb(201_162_74/0.6)]' },
  { from: 0, praise: '', colour: 'text-washi' },
];

const tier = computed(
  () => TIERS.find((step) => props.combo >= step.from) ?? TIERS[TIERS.length - 1],
);
const scale = computed(() => 1 + Math.min(props.combo * GROWTH_PER_MATCH, MAX_GROWTH));
</script>

<template>
  <div
    class="pointer-events-none flex h-[9dvh] items-center justify-center gap-3 font-card"
    aria-live="polite"
    data-testid="combo-meter"
  >
    <m.p
      v-if="combo >= SHOWN_FROM"
      :key="combo"
      class="flex items-baseline gap-2 font-bold"
      :class="tier?.colour"
      :initial="{ scale: scale * 1.5, opacity: 0.6 }"
      :animate="{ scale, opacity: 1 }"
      :transition="{ type: 'spring', stiffness: 520, damping: 14 }"
    >
      <span class="text-[5dvh] leading-none">{{ combo }}</span>
      <span class="text-[2.2dvh] tracking-widest uppercase" lang="en">combo</span>
      <span v-if="tier?.praise" class="text-[3dvh]" lang="ja">{{ tier.praise }}</span>
    </m.p>
    <m.p
      v-else-if="brokenCombo !== null"
      :key="`broken-${brokenCombo}`"
      class="font-bold text-vermilion"
      :initial="{ y: 0, opacity: 1, rotate: 0 }"
      :animate="{ y: 30, opacity: 0, rotate: -8 }"
      :transition="{ duration: 0.9, ease: 'easeIn' }"
      @animation-complete="$emit('brokenShown')"
    >
      <span class="text-[3.5dvh] line-through">{{ brokenCombo }} combo</span>
    </m.p>
  </div>
</template>
