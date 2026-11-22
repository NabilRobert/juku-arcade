<script setup lang="ts">
/**
 * The run's numbers: level, combo (it pops when it rises), the set timer,
 * the pause button, the sound switch, and what's happening (L5, L6, L9,
 * L12).
 */
import { m } from 'motion-v';
import { computed } from 'vue';
import { secondsLeft, type RunState } from '../game/run.ts';
import { MAX_LEVEL } from '../game/tuning.ts';
import { isMuted, playSound, setMuted } from '../sound/sfx.ts';
import PixelButton from './PixelButton.vue';

const props = defineProps<{ state: RunState; nowMs: number }>();
defineEmits<{ pause: []; resume: [] }>();

const isPaused = computed(() => props.state.pausedAtMs !== null);
const timeShare = computed(
  () => secondsLeft(props.state, props.nowMs) / (props.state.setDurationMs / 1000),
);
const isTimeLow = computed(() => timeShare.value < 0.25);

function toggleSound(): void {
  setMuted(!isMuted.value);
  playSound('pickUp');
}
</script>

<template>
  <section class="flex flex-col gap-3" aria-label="Run">
    <div class="grid grid-cols-2 gap-3">
      <p class="pixel-panel bg-wood/80 p-3 text-center">
        <span class="block text-xs tracking-widest text-aqua/80 uppercase">Level</span>
        <m.span
          :key="state.level"
          class="inline-block text-3xl font-bold"
          data-testid="level"
          :initial="{ scale: 1.8, color: '#a8dadc' }"
          :animate="{ scale: 1, color: '#f6efdf' }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          >{{ state.level }}</m.span
        >
        <span class="text-sm text-washi/60"> / {{ MAX_LEVEL }}</span>
      </p>
      <p class="pixel-panel bg-wood/80 p-3 text-center">
        <span class="block text-xs tracking-widest text-aqua/80 uppercase">Combo</span>
        <m.span
          :key="state.combo"
          class="inline-block text-3xl font-bold text-aqua"
          data-testid="combo"
          :initial="{ scale: state.combo > 0 ? 1.5 : 1 }"
          :animate="{ scale: 1 }"
          :transition="{ type: 'spring', stiffness: 500, damping: 18 }"
          >{{ state.combo }}</m.span
        >
      </p>
    </div>
    <div
      class="h-2.5 overflow-hidden bg-lacquer"
      role="progressbar"
      aria-label="Time left in this set"
      :aria-valuenow="Math.round(timeShare * 100)"
    >
      <div
        class="h-full transition-[width] duration-100"
        :class="isTimeLow ? 'bg-crimson' : 'bg-aqua'"
        :style="{ width: `${timeShare * 100}%` }"
      />
    </div>
    <PixelButton
      colour="steel"
      class="min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
      :disabled="state.phase !== 'playing'"
      :aria-pressed="isPaused"
      @click="isPaused ? $emit('resume') : $emit('pause')"
    >
      {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
    </PixelButton>
    <PixelButton
      colour="ghost"
      class="min-h-9 px-4 text-xs"
      :aria-pressed="!isMuted"
      @click="toggleSound"
    >
      {{ isMuted ? '🔇 Sound off' : '🔊 Sound on' }}
    </PixelButton>
    <p class="text-center text-xs text-washi/60">Best combo {{ state.bestCombo }}</p>
    <p v-if="isPaused" class="text-center text-sm text-aqua" role="status">
      Paused. Tap a word card to flip it. A card you peek at won't score.
    </p>
    <p
      v-else-if="state.phase === 'timedOut'"
      class="text-center text-sm text-crimson"
      role="status"
    >
      Time's up: here are the answers
    </p>
  </section>
</template>
