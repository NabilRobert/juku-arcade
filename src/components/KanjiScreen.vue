<script setup lang="ts">
/**
 * Kanji mode on screen (D37): a side panel (the mode, score, combo and
 * round, the last round's result, the sound switch) beside the kanji
 * board. It's practice: nothing is logged or reviewed. Its play time still
 * counts toward the nudges and the school's daily cap (usePlayClock), and
 * the same wellbeing screens stand in front of the board (WellbeingGate);
 * "Stop for today" goes back to the start screen.
 */
import { computed } from 'vue';
import type { Deck } from '../deck/types.ts';
import { useKanjiRun } from '../kanji/useKanjiRun.ts';
import { usePlayClock } from '../composables/usePlayClock.ts';
import { useWellbeing } from '../composables/useWellbeing.ts';
import type { Settings } from '../memory/storage.ts';
import KanjiBoard from './KanjiBoard.vue';
import KanjiResult from './KanjiResult.vue';
import SoundToggle from './SoundToggle.vue';
import WellbeingGate from './WellbeingGate.vue';

const props = defineProps<{
  deck: Deck;
  settings: Settings;
  /** True while another page covers the game: its play clock stops. */
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: [] }>();

const run = useKanjiRun(props.deck);
const { round, roundNumber, thrown, score, combo, bestCombo, impacts, canPlay, lastResult } = run;

// The clock first reads this a tick after setup, once the wellbeing state below exists.
const clock = usePlayClock(
  props.settings,
  () => props.isAway || isCapped.value || nudge.value !== null,
);
const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: clock.sessionPlayMs,
  playMsToday: clock.playMsToday,
  isAway: () => props.isAway,
  // Kanji mode has no timer to stop; the clock stops while a wellbeing screen shows.
  pause: () => undefined,
});

const panels = computed(() => [
  { label: 'Score', value: score.value },
  { label: 'Combo', value: combo.value },
]);

function dismiss(isStopping: boolean): void {
  dismissNudge(false);
  if (isStopping) emit('leave');
}
</script>

<template>
  <div class="grid grid-cols-[17rem_1fr] items-start gap-8">
    <aside class="sticky top-6 flex flex-col gap-3" aria-label="Kanji run">
      <section class="pixel-panel bg-wood/80 p-3 text-center">
        <p class="text-xs tracking-widest text-aqua/80 uppercase">Kanji mode · {{ deck.level }}</p>
        <p class="text-sm text-washi/70">Round {{ roundNumber }}</p>
      </section>
      <div class="grid grid-cols-2 gap-3">
        <p
          v-for="panel in panels"
          :key="panel.label"
          class="pixel-panel bg-wood/80 p-3 text-center"
        >
          <span class="block text-xs tracking-widest text-aqua/80 uppercase">{{
            panel.label
          }}</span>
          <span class="text-3xl font-bold" :data-testid="panel.label.toLowerCase()">{{
            panel.value
          }}</span>
        </p>
      </div>
      <KanjiResult :result="lastResult" />
      <SoundToggle />
      <p class="text-center text-xs text-washi/60">Best combo {{ bestCombo }}</p>
      <p class="text-center text-xs text-washi/60">
        Pick every reading of the kanji, then press Play. Practice only: it doesn't change your
        reviews.
      </p>
    </aside>
    <div class="flex flex-col gap-5">
      <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismiss">
        <KanjiBoard
          :round="round"
          :round-number="roundNumber"
          :level="deck.level"
          :status-of="run.statusOf"
          :thrown="thrown"
          :combo="combo"
          :impacts="impacts"
          :can-play="canPlay"
          @toggle="run.toggle"
          @play="run.play"
        />
      </WellbeingGate>
    </div>
  </div>
</template>
