<script setup lang="ts">
/**
 * One run on screen, laid out as a card table (D30): on laptops a side
 * panel (today's progress, the run's numbers, the set score) beside the
 * table; on phones the panel stacks above it. The table shows the board,
 * or a flipped card's back while paused, then the missed tray. Also shows
 * the wellbeing nudge (W1) and, past the daily cap, a stop screen (W2).
 */
import { computed, ref, watch } from 'vue';
import type { Deck } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import { dueNudge, isOverDailyCap, parseCapMinutes } from '../game/wellbeing.ts';
import { useRun } from '../composables/useRun.ts';
import type { Settings } from '../memory/storage.ts';
import CardBack from './CardBack.vue';
import DailyBar from './DailyBar.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';
import ScoreBreakdown from './ScoreBreakdown.vue';
import WellbeingNudge from './WellbeingNudge.vue';

const props = defineProps<{
  deck: Deck;
  settings: Settings;
  pastEvents: readonly GameEvent[];
  /** True while another page covers the game: it pauses. */
  isAway: boolean;
}>();
const run = useRun({
  words: props.deck.words,
  settings: props.settings,
  pastEvents: props.pastEvents,
});
const { state, nowMs, tags, progress, tap, pause, resume, flip } = run;

const CAP_MINUTES = parseCapMinutes(import.meta.env.VITE_DAILY_CAP_MINUTES);
const shownNudges = ref<number[]>([]);
const nudge = computed(() => dueNudge(run.sessionPlayMs.value, shownNudges.value));
const isCapped = computed(() => isOverDailyCap(run.playMsToday.value, CAP_MINUTES));

function dismissNudge(isStopping: boolean): void {
  if (nudge.value !== null) shownNudges.value = [...shownNudges.value, nudge.value];
  if (isStopping) pause();
}

watch([() => props.isAway, isCapped, nudge], ([isAway, capped, due]) => {
  if (isAway || capped || due !== null) pause();
});
</script>

<template>
  <div class="flex flex-col gap-5 md:grid md:grid-cols-[17rem_1fr] md:items-start md:gap-8">
    <aside class="flex flex-col gap-4 md:sticky md:top-6">
      <DailyBar :progress="progress" :level="deck.level" />
      <GameHud :state="state" :now-ms="nowMs" @pause="pause" @resume="resume" />
      <ScoreBreakdown
        :score="state.lastSetScore"
        :is-showing="state.phase === 'cleared'"
        :best-set-score="state.bestSetScore"
      />
    </aside>
    <div class="flex flex-col gap-5">
      <section v-if="isCapped" class="washi rounded-xl p-6 text-center text-sumi" role="status">
        <p class="font-card text-xl font-semibold">That's today's play. See you tomorrow!</p>
        <p class="mt-1 text-sm text-sumi/70">
          Your school set a daily limit of {{ CAP_MINUTES }} minutes.
        </p>
      </section>
      <WellbeingNudge
        v-else-if="nudge !== null"
        :minutes="nudge"
        @stop="dismissNudge(true)"
        @keep-going="dismissNudge(false)"
      />
      <CardBack
        v-else-if="state.flippedWord"
        :word="state.flippedWord"
        :kanji="deck.kanji"
        @close="flip(state.flippedWord)"
      />
      <GameBoard v-else :state="state" :now-ms="nowMs" :tags="tags" @tap="tap" @flip="flip" />
      <MissedTray :words="state.missedTray" :is-paused="state.pausedAtMs !== null" @flip="flip" />
    </div>
  </div>
</template>
