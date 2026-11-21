<script setup lang="ts">
/**
 * The heads-up display: level, combo, the set timer, bests, and the set
 * score when a set clears (L5–L7, L12).
 */
import { computed } from 'vue';
import { secondsLeft, type RunState } from '../game/run.ts';
import { MAX_LEVEL } from '../game/tuning.ts';

const props = defineProps<{ state: RunState; nowMs: number }>();

const timeShare = computed(
  () => secondsLeft(props.state, props.nowMs) / (props.state.setDurationMs / 1000),
);
const isTimeLow = computed(() => timeShare.value < 0.25);
</script>

<template>
  <section class="flex flex-col gap-3" aria-label="Score">
    <div class="flex items-end justify-between">
      <p>
        <span class="text-sm text-slate-400">Level</span>
        <span class="ml-1 text-2xl font-bold" data-testid="level">{{ state.level }}</span>
        <span class="text-sm text-slate-500"> / {{ MAX_LEVEL }}</span>
      </p>
      <p class="text-right">
        <span class="text-sm text-slate-400">Combo</span>
        <span class="ml-1 text-3xl font-bold text-amber-300" data-testid="combo">{{
          state.combo
        }}</span>
      </p>
    </div>
    <div
      class="h-2 overflow-hidden rounded-full bg-slate-800"
      role="progressbar"
      aria-label="Time left in this set"
      :aria-valuenow="Math.round(timeShare * 100)"
    >
      <div
        class="h-full rounded-full transition-[width] duration-100"
        :class="isTimeLow ? 'bg-rose-500' : 'bg-emerald-400'"
        :style="{ width: `${timeShare * 100}%` }"
      />
    </div>
    <p class="flex justify-between text-xs text-slate-400">
      <span>Best combo {{ state.bestCombo }}</span>
      <span>Best set {{ state.bestSetScore }}</span>
    </p>
    <p
      v-if="state.phase === 'cleared' && state.lastSetScore"
      class="text-center text-xl font-semibold text-amber-200"
      role="status"
    >
      {{ state.lastSetScore.chips }} × {{ state.lastSetScore.multiplier }} =
      {{ state.lastSetScore.total }}
    </p>
    <p v-else-if="state.phase === 'timedOut'" class="text-center text-rose-300" role="status">
      Time's up: here are the answers
    </p>
  </section>
</template>
