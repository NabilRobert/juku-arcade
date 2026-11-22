<script setup lang="ts">
/**
 * One run on screen, laid out as a card table (D30) for a laptop or
 * desktop screen, the only kind the school uses: a side panel (today's
 * progress, the run's numbers, the set score) beside the table. The
 * table shows the board,
 * or a flipped card's back while paused, then the missed tray. Also shows
 * the wellbeing nudge (W1) and, past the daily cap, a stop screen (W2).
 */
import { computed } from 'vue';
import type { Deck } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import { useRun } from '../composables/useRun.ts';
import { useWellbeing } from '../composables/useWellbeing.ts';
import { usePauseKey } from '../composables/usePauseKey.ts';
import type { Settings } from '../memory/storage.ts';
import CardBack from './CardBack.vue';
import DailyBar from './DailyBar.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';
import ScoreBreakdown from './ScoreBreakdown.vue';
import WellbeingGate from './WellbeingGate.vue';
import BankPanel from '../roguelike/BankPanel.vue';
import RunOver from '../roguelike/RunOver.vue';
import ShopOffer from '../roguelike/ShopOffer.vue';
import { useBankRun } from '../roguelike/useBankRun.ts';
import { CRESTS } from '../roguelike/specials.ts';

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
  // The bank run holds the next set while its shop or end screen is open.
  isHoldingNextDeal: () => bankRun.isHolding.value,
});
const { state, nowMs, tags, progress, throwReading, pause, resume, flip } = run;
const bankRun = useBankRun(() => state.value, { endCombo: run.endCombo, pause });
const { run: bank, notice, bestRound, shownCrests } = bankRun;
/** The scouted crests, marked on the word cards until the set ends. */
const crestMarks = computed(
  () => new Map([...shownCrests.value].map(([wordId, kind]) => [wordId, CRESTS[kind]])),
);

const { nudge, isCapped, dismissNudge } = useWellbeing({
  sessionPlayMs: run.sessionPlayMs,
  playMsToday: run.playMsToday,
  isAway: () => props.isAway,
  pause,
});

usePauseKey({
  isPaused: () => state.value.pausedAtMs !== null,
  isAvailable: () => !props.isAway && state.value.phase === 'playing',
  pause,
  resume,
});
</script>

<template>
  <div class="grid grid-cols-[17rem_1fr] items-start gap-8">
    <aside class="sticky top-6 flex flex-col gap-4">
      <DailyBar :progress="progress" :level="deck.level" />
      <GameHud :state="state" :now-ms="nowMs" @pause="pause" @resume="resume" />
      <BankPanel
        :run="bank"
        :notice="notice"
        :can-scout="state.phase === 'playing' && state.pausedAtMs === null"
        @bank="bankRun.bank"
        @scout="bankRun.scout"
      />
      <ScoreBreakdown
        :score="state.lastSetScore"
        :is-showing="state.phase === 'cleared'"
        :best-set-score="state.bestSetScore"
      />
    </aside>
    <div class="flex flex-col gap-5">
      <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismissNudge">
        <CardBack
          v-if="state.flippedWord"
          :word="state.flippedWord"
          :kanji="deck.kanji"
          @close="flip(state.flippedWord)"
        />
        <GameBoard
          v-else
          :state="state"
          :now-ms="nowMs"
          :tags="tags"
          :level="deck.level"
          :crest-marks="crestMarks"
          @throw="throwReading"
          @flip="flip"
        />
      </WellbeingGate>
      <MissedTray :words="state.missedTray" :is-paused="state.pausedAtMs !== null" @flip="flip" />
    </div>
    <ShopOffer
      v-if="bank.offer !== null"
      :run="bank"
      @buy="bankRun.buy"
      @leave="bankRun.leaveShop"
    />
    <RunOver
      v-else-if="bank.isOver"
      :run="bank"
      :best-round="bestRound"
      @new-run="bankRun.newRun"
    />
  </div>
</template>
