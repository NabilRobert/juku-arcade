<script setup lang="ts">
/**
 * Bunpou on screen (D56): a side panel (the mode, score, level and best
 * combo, the sound switch) beside the table, or the revealed tale after
 * its last line. Like kanji mode, its play time counts toward the nudges
 * and the school's daily cap (usePlayClock), the wellbeing screens stand
 * in front of the table, and "Stop for today" goes back to the start
 * screen. Nothing is logged yet: grammar reviews come in G2.
 */
import { computed } from 'vue';
import { useBunpouRun } from '../../grammar/useBunpouRun.ts';
import { usePauseKey } from '../../composables/usePauseKey.ts';
import { usePlayClock } from '../../composables/usePlayClock.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import type { Settings } from '../../memory/storage.ts';
import SoundToggle from '../ui/SoundToggle.vue';
import StatPanel from '../ui/StatPanel.vue';
import WellbeingGate from '../WellbeingGate.vue';
import BunpouBoard from './BunpouBoard.vue';
import TaleReveal from './TaleReveal.vue';

const props = defineProps<{
  level: string;
  settings: Settings;
  /** True while another page covers the game: the line's clock and the play clock stop. */
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: [] }>();

const game = useBunpouRun();
const { run, unplaced, timeLeft } = game;
const isPaused = (): boolean => run.value.pausedAtMs !== null;

// The clock first reads this a tick after setup, once the wellbeing state below exists.
const clock = usePlayClock(
  props.settings,
  () => props.isAway || isPaused() || isCapped.value || nudge.value !== null,
);
const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: clock.sessionPlayMs,
  playMsToday: clock.playMsToday,
  isAway: () => props.isAway,
  pause: game.pause,
});
usePauseKey({
  isPaused,
  isAvailable: () => !props.isAway && run.value.phase === 'building',
  pause: game.pause,
  resume: game.resume,
});

const panels = computed(() => [
  { label: 'Score', value: run.value.score },
  { label: 'Level', value: run.value.level },
]);

function dismiss(isStopping: boolean): void {
  dismissNudge(false);
  if (isStopping) emit('leave');
}
</script>

<template>
  <div class="grid grid-cols-[17rem_1fr] items-start gap-8">
    <aside class="sticky top-6 flex flex-col gap-3" aria-label="Bunpou run">
      <section class="pixel-panel bg-wood/80 p-3 text-center">
        <p class="text-xs tracking-widest text-aqua/80 uppercase">Bunpou · {{ level }}</p>
      </section>
      <div class="grid grid-cols-2 gap-3">
        <StatPanel v-for="panel in panels" :key="panel.label" :label="panel.label">
          <span class="text-3xl font-bold" :data-testid="panel.label.toLowerCase()">{{
            panel.value
          }}</span>
        </StatPanel>
      </div>
      <SoundToggle />
      <p class="text-center text-xs text-washi/60">Best combo {{ run.bestCombo }}</p>
      <p class="text-center text-xs text-washi/60">
        Tap the tiles in order, or drag them into place. Tap a placed tile, or press Backspace, to
        take it back. Keys 1–5 place a tile; Esc pauses.
      </p>
    </aside>
    <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismiss">
      <TaleReveal v-if="run.phase === 'revealed'" :results="run.results" @next="game.nextTale" />
      <BunpouBoard
        v-else
        :run="run"
        :unplaced="unplaced"
        :time-left="timeLeft"
        @place="game.place"
        @take-back="game.takeBack"
        @pause="game.pause"
        @resume="game.resume"
      />
    </WellbeingGate>
  </div>
</template>
