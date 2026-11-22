<script setup lang="ts">
/**
 * Stands in front of the table in both modes (W1, W2): past the school's
 * daily cap it shows the stop screen, when a nudge is due it shows the
 * nudge, and otherwise it shows the table (its slot).
 */
import { CAP_MINUTES } from '../composables/useWellbeing.ts';
import WellbeingNudge from './WellbeingNudge.vue';

defineProps<{ isCapped: boolean; nudge: number | null }>();
defineEmits<{ dismiss: [isStopping: boolean] }>();
</script>

<template>
  <section v-if="isCapped" class="pixel-panel washi p-6 text-center text-sumi" role="status">
    <p class="font-card text-xl font-semibold">That's today's play. See you tomorrow!</p>
    <p class="mt-1 text-sm text-sumi/70">
      Your school set a daily limit of {{ CAP_MINUTES }} minutes.
    </p>
  </section>
  <WellbeingNudge
    v-else-if="nudge !== null"
    :minutes="nudge"
    @stop="$emit('dismiss', true)"
    @keep-going="$emit('dismiss', false)"
  />
  <slot v-else />
</template>
