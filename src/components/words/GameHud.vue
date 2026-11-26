<script setup lang="ts">
/**
 * The run's numbers: level, combo (it pops when it rises), the set timer,
 * the pause button, the sound switch, and what's happening (L5, L6, L9,
 * L12).
 */
import TimerBar from '../ui/TimerBar.vue';
import { themeColour } from '../ui/theme-colour.ts';
import { m } from 'motion-v';
import { computed } from 'vue';
import { timeShareLeft, type RunState } from '../../game/run.ts';
import { MAX_LEVEL } from '../../game/tuning.ts';
import PauseButton from '../ui/PauseButton.vue';
import SoundToggle from '../ui/SoundToggle.vue';
import StatPanel from '../ui/StatPanel.vue';

const props = defineProps<{ state: RunState; nowMs: number }>();
defineEmits<{ pause: []; resume: [] }>();

const isPaused = computed(() => props.state.pausedAtMs !== null);
const timeShare = computed(() => timeShareLeft(props.state, props.nowMs));
/** A new level flashes aqua, then settles to the panel's white (palette tokens, read once). */
const LEVEL_UP_COLOUR = themeColour('aqua');
const LEVEL_COLOUR = themeColour('washi');
</script>

<template>
  <section class="flex flex-col gap-3" aria-label="Run">
    <div class="grid grid-cols-2 gap-3">
      <StatPanel label="Level">
        <m.span
          :key="state.level"
          class="inline-block text-3xl font-bold"
          data-testid="level"
          :initial="{ scale: 1.8, color: LEVEL_UP_COLOUR }"
          :animate="{ scale: 1, color: LEVEL_COLOUR }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
          >{{ state.level }}</m.span
        >
        <span class="text-sm text-washi/60"> / {{ MAX_LEVEL }}</span>
      </StatPanel>
      <StatPanel label="Combo">
        <m.span
          :key="state.combo"
          class="inline-block text-3xl font-bold text-aqua"
          data-testid="combo"
          :initial="{ scale: state.combo > 0 ? 1.5 : 1 }"
          :animate="{ scale: 1 }"
          :transition="{ type: 'spring', stiffness: 500, damping: 18 }"
          >{{ state.combo }}</m.span
        >
      </StatPanel>
    </div>
    <TimerBar :time-left="timeShare" label="Time left in this set" />
    <PauseButton
      class="max-lg:hidden"
      :is-paused="isPaused"
      :is-disabled="state.phase !== 'playing'"
      @pause="$emit('pause')"
      @resume="$emit('resume')"
    />
    <SoundToggle />
    <p class="text-center text-xs text-washi/60">Best combo {{ state.bestCombo }}</p>
    <p v-if="state.phase === 'timedOut'" class="text-center text-sm text-crimson" role="status">
      Time's up: here are the answers
    </p>
  </section>
</template>
