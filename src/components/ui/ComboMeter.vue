<script setup lang="ts">
/**
 * The combo as a style rank (D39), on the table between the word cards and
 * the hand, where the player is looking. A big letter grade (combo-ranks.ts)
 * slams in at each new rank with a sound, beside its word of praise, the
 * combo count and a bar filling toward the next rank. The letter, the word
 * and the combo count all warm rank by rank, to a bright red at SSS. The
 * meter floats gently while it waits, like the cards. A lost streak drops
 * away in crimson.
 */
import { m } from 'motion-v';
import { computed, watch } from 'vue';
import { playSound } from '../../sound/sfx.ts';
import { rankFor } from '../../game/combo-ranks.ts';
import { RANK_COLOURS } from './combo-rank-colours.ts';

const props = defineProps<{ combo: number; brokenCombo: number | null }>();
defineEmits<{ brokenShown: [] }>();

/** The rank-up sound, pitched up so it isn't mistaken for a level up. */
const RANK_UP_PITCH = 1.5;
/** The meter's float: livelier than the cards', so it reads as alive. */
const FLOAT_STYLE = { '--float-px': '5px', '--float-deg': '2deg', animationDuration: '2.4s' };

const progress = computed(() => rankFor(props.combo));
const rank = computed(() => progress.value.rank);

watch(
  () => rank.value?.letter,
  (letter, before) => {
    if (letter !== undefined && before !== undefined) playSound('levelUp', RANK_UP_PITCH);
  },
);
</script>

<template>
  <div
    class="pointer-events-none flex h-[9svh] items-center justify-center"
    aria-live="polite"
    data-testid="combo-meter"
  >
    <div
      v-if="rank"
      class="flex animate-float items-center gap-3 motion-reduce:animate-none"
      :style="FLOAT_STYLE"
    >
      <m.span
        :key="rank.letter"
        class="text-[7svh] leading-none font-bold"
        :class="RANK_COLOURS[rank.letter]"
        :initial="{ scale: 2.2, rotate: -12, opacity: 0 }"
        :animate="{ scale: 1, rotate: 0, opacity: 1 }"
        :transition="{ type: 'spring', stiffness: 420, damping: 13 }"
        data-testid="combo-rank"
        >{{ rank.letter }}</m.span
      >
      <span class="flex flex-col gap-1">
        <span
          class="text-[3svh] leading-none font-bold"
          :class="RANK_COLOURS[rank.letter]"
          lang="ja"
          :title="rank.meaning"
          >{{ rank.praise }}</span
        >
        <m.span
          :key="combo"
          class="text-[2svh] leading-none tracking-widest uppercase"
          :class="RANK_COLOURS[rank.letter]"
          lang="en"
          :initial="{ scale: 1.4 }"
          :animate="{ scale: 1 }"
          :transition="{ type: 'spring', stiffness: 520, damping: 14 }"
          >{{ combo }} combo</m.span
        >
        <span class="h-1 w-24 bg-lacquer" aria-hidden="true">
          <span
            class="block h-full bg-aqua transition-[width] duration-200"
            :style="{ width: `${progress.towardNext * 100}%` }"
          />
        </span>
      </span>
    </div>
    <m.p
      v-else-if="brokenCombo !== null"
      :key="`broken-${brokenCombo}`"
      class="font-bold text-crimson drop-shadow-[0_0_6px_color-mix(in_srgb,var(--color-washi)_90%,transparent)]"
      :initial="{ y: 0, opacity: 1, rotate: 0 }"
      :animate="{ y: 30, opacity: 0, rotate: -8 }"
      :transition="{ duration: 0.9, ease: 'easeIn' }"
      @animation-complete="$emit('brokenShown')"
    >
      <span class="text-[3.5svh] line-through">{{ brokenCombo }} combo</span>
    </m.p>
  </div>
</template>
