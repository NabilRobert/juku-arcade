<script setup lang="ts">
/**
 * A dojo run on screen (D62): a side panel (the mode, the lanterns, the
 * score, Pause, the sound switch, End run) beside the question, which
 * isn't timed (D69), or, once the last lantern is out, a recap (the score
 * and the best combo) with a quote, Restart and Quit to main menu. Like the other
 * modes, its play time counts toward the nudges and the daily cap, and the
 * wellbeing screens stand in front of the question.
 */
import { computed } from 'vue';
import type { JlptLevel } from '../../deck/types.ts';
import type { DojoPools } from '../../dojo/dojo-questions.ts';
import { LANTERNS } from '../../dojo/dojo-run.ts';
import { pickQuote } from '../../dojo/quotes.ts';
import { useDojoRun } from '../../dojo/useDojoRun.ts';
import { usePanelPause } from '../../composables/usePanelPause.ts';
import { usePauseKey, type PauseKeyInput } from '../../composables/usePauseKey.ts';
import { usePreviousBest } from '../../composables/usePreviousBest.ts';
import { usePlayClock } from '../../composables/usePlayClock.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import type { Settings } from '../../memory/storage.ts';
import FloatingPause from '../ui/FloatingPause.vue';
import EndRunButton from '../ui/EndRunButton.vue';
import SidePanel from '../ui/SidePanel.vue';
import ModeHeader from '../ui/ModeHeader.vue';
import PauseButton from '../ui/PauseButton.vue';
import RunResults from '../ui/RunResults.vue';
import SoundToggle from '../ui/SoundToggle.vue';
import StatPanel from '../ui/StatPanel.vue';
import WellbeingGate from '../WellbeingGate.vue';
import DojoQuestionView from './DojoQuestionView.vue';
import LanternRow from './LanternRow.vue';
import QuoteCard from '../ui/QuoteCard.vue';

const props = defineProps<{
  pools: DojoPools;
  level: JlptLevel;
  settings: Settings;
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: []; again: [] }>();

const dojo = useDojoRun(props.pools);
const { state, question, isLocked, isPaused } = dojo;

// The clock first reads this a tick after setup, once the wellbeing state below exists.
const clock = usePlayClock(
  props.settings,
  () => props.isAway || state.value.isOver || isPaused.value || nudge.value !== null,
);
const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: clock.sessionPlayMs,
  playMsToday: clock.playMsToday,
  isAway: () => props.isAway,
  pause: dojo.pause,
});
const pauseControls: PauseKeyInput = {
  isPaused: () => isPaused.value,
  isAvailable: () => !props.isAway && !state.value.isOver,
  pause: dojo.pause,
  resume: dojo.resume,
};
usePauseKey(pauseControls);
/** Opening the drawer on a phone or a tablet pauses the run, as it covers the board. */
const onPanelToggle = usePanelPause(pauseControls);
/** Asking "End this run?" pauses the question's clock too, on its own count, like the drawer. */
const onEndRunToggle = usePanelPause(pauseControls);

const resultPanels = computed(() => [
  { label: 'Your score was', value: String(state.value.right) },
  { label: 'Your best combo was', value: String(state.value.bestCombo) },
]);
const previousBest = usePreviousBest('dojo');
/** Picked once per run, for its game-over screen. */
const quote = pickQuote(Math.random);

function dismiss(isStopping: boolean): void {
  dismissNudge(false);
  if (isStopping) emit('leave');
}
</script>

<template>
  <div class="flex flex-col gap-4 lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
    <SidePanel label="Dojo run" @toggle="onPanelToggle">
      <ModeHeader :title="`Practice mode · ${level}`" />
      <LanternRow :lit="state.lanterns" :total="LANTERNS" />
      <StatPanel label="Score">
        <span class="text-3xl font-bold" data-testid="score">{{ state.right }}</span>
      </StatPanel>
      <PauseButton
        v-if="!state.isOver"
        class="max-lg:hidden"
        :is-paused="isPaused"
        @pause="dojo.pause"
        @resume="dojo.resume"
      />
      <SoundToggle />
      <EndRunButton v-if="!state.isOver" @end="dojo.endNow" @toggle="onEndRunToggle" />
      <p class="text-center text-xs text-washi/60">
        Words, kanji and grammar you've met, until three misses. Take as long as you need. Esc
        pauses.
      </p>
    </SidePanel>
    <FloatingPause
      v-if="!state.isOver"
      :is-paused="isPaused"
      @pause="dojo.pause"
      @resume="dojo.resume"
    />
    <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismiss">
      <RunResults
        v-if="state.isOver"
        :title="state.lanterns > 0 ? 'Run ended' : 'Game over'"
        :panels="resultPanels"
        again-label="Restart"
        leave-label="Quit to main menu"
        :comparison="{ score: state.right, previousBest }"
        @again="emit('again')"
        @leave="emit('leave')"
      >
        <QuoteCard :quote="quote" />
      </RunResults>
      <p
        v-else-if="isPaused"
        class="pixel-panel bg-wood/80 p-10 text-center text-xl"
        data-testid="dojo-paused"
      >
        Paused
      </p>
      <div v-else class="flex flex-col gap-6">
        <DojoQuestionView
          :key="state.answered"
          :question="question"
          :level="level"
          :combo="state.combo"
          :is-locked="isLocked"
          :is-paused="isPaused"
          @answer="dojo.answer"
          @pause="dojo.pause"
          @resume="dojo.resume"
        />
      </div>
    </WellbeingGate>
  </div>
</template>
