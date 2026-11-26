<script setup lang="ts">
/**
 * A notice (useNotice.ts) floating down out of its panel and fading: aqua
 * for a gain, crimson for a loss. The parent is `relative`; the notice
 * hangs just below it and never catches the pointer.
 */
import { m } from 'motion-v';
import type { Notice } from '../../composables/useNotice.ts';

defineProps<{ notice: Notice | null }>();

/** How far it drifts (px) and how long it takes to fade (s). */
const DRIFT_PX = 24;
const FADE_S = 1.3;
</script>

<template>
  <m.p
    v-if="notice"
    :key="notice.key"
    class="pointer-events-none absolute inset-x-0 top-full font-bold drop-shadow-[0_0_6px_color-mix(in_srgb,var(--color-washi)_90%,transparent)]"
    :class="notice.isGood ? 'text-aqua' : 'text-crimson'"
    :initial="{ y: 0, opacity: 1 }"
    :animate="{ y: DRIFT_PX, opacity: 0 }"
    :transition="{ duration: FADE_S, ease: 'easeIn' }"
    data-testid="notice"
  >
    {{ notice.text }}
  </m.p>
</template>
