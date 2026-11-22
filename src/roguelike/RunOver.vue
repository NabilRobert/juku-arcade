<script setup lang="ts">
/**
 * The end of a bank run: the round it reached and what was banked,
 * against the best round, and a button to start again. The learning carries
 * on either way; only the bank run resets.
 */
import PixelButton from '../components/PixelButton.vue';
import type { BankRun } from './bank-run.ts';

defineProps<{ run: BankRun; bestRound: number }>();
defineEmits<{ newRun: [] }>();
</script>

<template>
  <div
    class="fixed inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-lacquer/90 text-center"
    role="dialog"
    aria-label="Run over"
  >
    <p class="font-card text-4xl font-bold text-crimson drop-shadow-[0_0_8px_rgb(241_250_238/0.8)]">
      Run over
    </p>
    <p class="text-lg">
      Round {{ run.round }}: banked {{ run.bankedThisRound }} of {{ run.target }}.
      <span class="text-washi/60">Best round {{ bestRound }}.</span>
    </p>
    <PixelButton colour="crimson" class="min-h-11 px-8 text-lg" @click="$emit('newRun')">
      New run
    </PixelButton>
  </div>
</template>
