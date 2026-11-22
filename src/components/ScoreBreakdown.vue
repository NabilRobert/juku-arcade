<script setup lang="ts">
/**
 * The set score as it's earned (L7): chips on paper, the multiplier in a
 * crimson stamp, and the total counting up when a set clears. Shows the
 * best set between clears.
 */
import { onUnmounted, ref, watch } from 'vue';
import type { SetScore } from '../game/score.ts';

const props = defineProps<{ score: SetScore | null; isShowing: boolean; bestSetScore: number }>();

/** How long the total takes to count up. */
const COUNT_UP_MS = 600;

const shownTotal = ref(0);
let frame = 0;

/**
 * Counts the total up with an ease-out curve. A dozen lines of
 * requestAnimationFrame, instead of pulling Motion's full animation engine
 * into the bundle for one number.
 */
function countUpTo(total: number): void {
  cancelAnimationFrame(frame);
  const reducesMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const startedAt = performance.now();
  const step = (now: number): void => {
    const progress = reducesMotion ? 1 : Math.min((now - startedAt) / COUNT_UP_MS, 1);
    shownTotal.value = Math.round(total * (1 - (1 - progress) ** 3));
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

watch(
  () => [props.isShowing, props.score?.total] as const,
  ([isShowing, total]) => {
    if (isShowing && total !== undefined) countUpTo(total);
  },
);
onUnmounted(() => cancelAnimationFrame(frame));
</script>

<template>
  <section class="rounded-xl bg-wood/80 p-3 text-center" aria-label="Set score">
    <template v-if="isShowing && score">
      <p class="flex items-center justify-center gap-2 text-2xl font-bold">
        <span class="washi rounded-md px-3 py-1 text-sumi" title="Chips">{{ score.chips }}</span>
        <span class="text-aqua">×</span>
        <span class="rounded-md bg-crimson px-3 py-1 text-washi" title="Multiplier">{{
          score.multiplier
        }}</span>
      </p>
      <p class="mt-2 text-3xl font-bold text-aqua" role="status">{{ shownTotal }}</p>
    </template>
    <template v-else>
      <p class="text-xs tracking-widest text-aqua/80 uppercase">Best set</p>
      <p class="text-2xl font-bold">{{ bestSetScore }}</p>
    </template>
  </section>
</template>
