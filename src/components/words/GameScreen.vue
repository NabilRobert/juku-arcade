<script setup lang="ts">
/**
 * One run on screen, laid out as a card table (D30) for a laptop or
 * desktop screen, the only kind the game supports: a side panel (today's
 * progress, the run's numbers, the bank run) beside the table. The
 * table shows the board,
 * or a flipped card's back while paused, then the missed tray. Clearing
 * today's deck shows a banner and play goes on (useDeckFinish.ts, D70);
 * End run shows the run's results. Also shows
 * the wellbeing nudge (W1) and, past the daily cap, a stop screen (W2).
 */
import { computed, useTemplateRef, watch } from 'vue';
import type { Deck, DeckWord } from '../../deck/types.ts';
import type { GameEvent } from '../../game/events.ts';
import { useRun } from '../../composables/useRun.ts';
import { timeShareLeft } from '../../game/run.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import { usePanelPause } from '../../composables/usePanelPause.ts';
import { usePauseKey, type PauseKeyInput } from '../../composables/usePauseKey.ts';
import { useRunLog } from '../../composables/useRunLog.ts';
import { useDeckFinish } from '../../composables/useDeckFinish.ts';
import { usePreviousBest } from '../../composables/usePreviousBest.ts';
import { tallyWordEvents } from '../../memory/play-log.ts';
import type { Settings } from '../../memory/storage.ts';
import CardBack from './CardBack.vue';
import DailyBar from './DailyBar.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';
import WellbeingGate from '../WellbeingGate.vue';
import BankPanel from '../bank-run/BankPanel.vue';
import ShopOffer from '../bank-run/ShopOffer.vue';
import FloatingBanner from '../ui/FloatingBanner.vue';
import FloatingPause from '../ui/FloatingPause.vue';
import EndRunButton from '../ui/EndRunButton.vue';
import SidePanel from '../ui/SidePanel.vue';
import TimerBar from '../ui/TimerBar.vue';
import RunResults from '../ui/RunResults.vue';
import { readBestScore, useBankRun } from '../../bank-run/useBankRun.ts';
import { CRESTS } from '../../bank-run/crests.ts';
import { playSound } from '../../sound/sfx.ts';

const emit = defineEmits<{ leave: [] }>();
const props = defineProps<{
  deck: Deck;
  settings: Settings;
  pastEvents: readonly GameEvent[];
  /** True while another page covers the game: it pauses. */
  isAway: boolean;
}>();
const board = useTemplateRef<InstanceType<typeof GameBoard>>('board');
const run = useRun({
  words: props.deck.words,
  settings: props.settings,
  pastEvents: props.pastEvents,
  // Cards laid when time runs out are played, not lost.
  beforeTimeUp: () => board.value?.playLaidCards(),
});
const { state, nowMs, progress, throwReading, pause, resume } = run;

/** Turning a card over to read its back, or back again, while paused: the card's flick (D53). */
function inspect(word: DeckWord): void {
  playSound('pickUp');
  run.flip(word);
}
const bankRun = useBankRun(
  () => state.value,
  { endCombo: run.endCombo, pause, resume },
  Math.random,
);
const { run: bank, notice, shownCrests } = bankRun;
/** The scouted crests, marked on the word cards until the set ends. */
const crestMarks = computed(
  () => new Map([...shownCrests.value].map(([wordId, kind]) => [wordId, CRESTS[kind]])),
);

// Clearing today's deck shows a banner; End run banks the pot and shows the results.
const finish = useDeckFinish(
  () => progress.value.daily.isCleared,
  () => {
    bankRun.bank();
    pause();
  },
);
const previousBest = usePreviousBest('words', readBestScore);
// Every answer or bank goes to the play log, for the streak, the calendar and the board.
const runLog = useRunLog('words');
watch([() => state.value.events.length, () => bank.value.coins], () =>
  runLog.record({ score: bank.value.coins, ...tallyWordEvents(state.value.events) }),
);

const finishNote = computed(() =>
  progress.value.daily.isCleared
    ? "Your pot was banked, and today's deck is done. Come back tomorrow for the next words."
    : "Your pot was banked. Today's deck isn't done yet: keep playing, or come back to finish it.",
);

const finishPanels = computed(() => [
  { label: 'Coins', value: String(bank.value.coins) },
  { label: 'Today', value: `${progress.value.daily.done} / ${progress.value.daily.total}` },
  { label: 'Words known', value: `${progress.value.wordsKnown} / ${progress.value.deckSize}` },
]);

function keepPlaying(): void {
  finish.keepPlaying();
  resume();
}

const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: run.sessionPlayMs,
  playMsToday: run.playMsToday,
  isAway: () => props.isAway,
  pause,
});

const pauseControls: PauseKeyInput = {
  isPaused: () => state.value.pausedAtMs !== null,
  isAvailable: () => !props.isAway && !finish.isShown.value && state.value.phase === 'playing',
  pause,
  resume,
};
usePauseKey(pauseControls);
/** Opening the drawer on a phone or a tablet pauses the run, as it covers the board. */
const onPanelToggle = usePanelPause(pauseControls);
/** Asking "End this run?" pauses the set's clock too, on its own count, like the drawer. */
const onEndRunToggle = usePanelPause(pauseControls);
</script>

<template>
  <div class="flex flex-col gap-4 lg:grid lg:grid-cols-[17rem_1fr] lg:items-start lg:gap-8">
    <SidePanel label="Word run" @toggle="onPanelToggle">
      <DailyBar
        :daily="progress.daily"
        known-label="Words known"
        :known="progress.wordsKnown"
        :total="progress.deckSize"
        :level="deck.level"
        :days-played-this-week="progress.daysPlayedThisWeek"
      />
      <GameHud :state="state" :now-ms="nowMs" @pause="pause" @resume="resume" />
      <BankPanel
        :run="bank"
        :notice="notice"
        :can-scout="state.phase === 'playing' && state.pausedAtMs === null"
        @bank="bankRun.bank"
        @scout="bankRun.scout"
        @open-shop="bankRun.openShop"
      />
      <EndRunButton v-if="!finish.isShown.value" @end="finish.endNow" @toggle="onEndRunToggle" />
    </SidePanel>
    <div class="flex flex-col gap-5">
      <!-- On a phone the panel with the set's timer is folded away, so the timer shows here too. -->
      <TimerBar class="lg:hidden" :time-left="timeShareLeft(state, nowMs)" />
      <FloatingBanner :is-shown="finish.isBannerShown.value" lang="ja">
        今日の分 完了 · <span lang="en">Today's deck done!</span>
      </FloatingBanner>
      <FloatingPause
        :is-paused="state.pausedAtMs !== null"
        :is-disabled="state.phase !== 'playing' || finish.isShown.value"
        @pause="pause"
        @resume="resume"
      />
      <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismissNudge">
        <RunResults
          v-if="finish.isShown.value"
          title="Run ended"
          :panels="finishPanels"
          :note="finishNote"
          again-label="Keep playing"
          :comparison="{ score: bank.coins, previousBest }"
          @again="keepPlaying"
          @leave="emit('leave')"
        />
        <CardBack
          v-else-if="state.flippedWord"
          :word="state.flippedWord"
          :kanji="deck.kanji"
          @close="inspect(state.flippedWord)"
        />
        <!-- Hidden, not removed, while a card's back shows: rebuilding it would re-deal the set. -->
        <GameBoard
          v-show="!state.flippedWord && !finish.isShown.value"
          ref="board"
          :state="state"
          :now-ms="nowMs"
          :level="deck.level"
          :crest-marks="crestMarks"
          @throw="throwReading"
          @flip="inspect"
        />
      </WellbeingGate>
      <MissedTray
        :words="state.missedTray"
        :is-paused="state.pausedAtMs !== null"
        @flip="inspect"
      />
    </div>
    <ShopOffer
      v-if="bank.shop === 'open'"
      :run="bank"
      @buy="bankRun.buy"
      @leave="bankRun.closeShop"
    />
  </div>
</template>
