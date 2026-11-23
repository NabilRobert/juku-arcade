<script setup lang="ts">
/**
 * One run on screen, laid out as a card table (D30) for a laptop or
 * desktop screen, the only kind the game supports: a side panel (today's
 * progress, the run's numbers, the bank run) beside the table. The
 * table shows the board,
 * or a flipped card's back while paused, then the missed tray. Also shows
 * the wellbeing nudge (W1) and, past the daily cap, a stop screen (W2).
 */
import { computed } from 'vue';
import type { Deck, DeckWord } from '../../deck/types.ts';
import type { GameEvent } from '../../game/events.ts';
import { useRun } from '../../composables/useRun.ts';
import { useWellbeing } from '../../composables/useWellbeing.ts';
import { usePauseKey } from '../../composables/usePauseKey.ts';
import type { Settings } from '../../memory/storage.ts';
import CardBack from './CardBack.vue';
import DailyBar from './DailyBar.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';
import WellbeingGate from '../WellbeingGate.vue';
import BankPanel from '../bank-run/BankPanel.vue';
import ShopOffer from '../bank-run/ShopOffer.vue';
import { useBankRun } from '../../bank-run/useBankRun.ts';
import { CRESTS } from '../../bank-run/crests.ts';
import { playSound } from '../../sound/sfx.ts';

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
const { state, nowMs, progress, throwReading, pause, resume } = run;

/** Turning a card over to read its back, or back again, while paused: the card's flick (D53). */
function inspect(word: DeckWord): void {
  playSound('pickUp');
  run.flip(word);
}
const bankRun = useBankRun(() => state.value, { endCombo: run.endCombo, pause, resume });
const { run: bank, notice, shownCrests } = bankRun;
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
        @open-shop="bankRun.openShop"
      />
    </aside>
    <div class="flex flex-col gap-5">
      <!-- Over the board, where the player is looking, rather than in the taller side panel. -->
      <p
        v-if="state.pausedAtMs !== null"
        class="pixel-panel bg-wood/80 px-4 py-2 text-center text-sm text-aqua"
        role="status"
      >
        Paused. Tap a word card to flip it. A card you peek at won't score.
      </p>
      <WellbeingGate :is-capped="isCapped" :nudge="nudge" @dismiss="dismissNudge">
        <CardBack
          v-if="state.flippedWord"
          :word="state.flippedWord"
          :kanji="deck.kanji"
          @close="inspect(state.flippedWord)"
        />
        <!-- Hidden, not removed, while a card's back shows: rebuilding it would re-deal the set. -->
        <GameBoard
          v-show="!state.flippedWord"
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
