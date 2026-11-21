<script setup lang="ts">
/**
 * One run on screen: today's progress, the HUD, then the board (or a
 * flipped card's back while paused), then the missed tray. Driven by useRun.
 */
import { watch } from 'vue';
import type { Deck } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import { useRun } from '../composables/useRun.ts';
import type { Settings } from '../memory/storage.ts';
import CardBack from './CardBack.vue';
import DailyBar from './DailyBar.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';

const props = defineProps<{
  deck: Deck;
  settings: Settings;
  pastEvents: readonly GameEvent[];
  /** True while another page covers the game: it pauses. */
  isAway: boolean;
}>();
const { state, nowMs, tags, progress, tap, pause, resume, flip } = useRun({
  words: props.deck.words,
  settings: props.settings,
  pastEvents: props.pastEvents,
});

watch(
  () => props.isAway,
  (isAway) => {
    if (isAway) pause();
  },
);
</script>

<template>
  <div class="flex flex-col gap-5">
    <DailyBar :progress="progress" :level="deck.level" />
    <GameHud :state="state" :now-ms="nowMs" @pause="pause" @resume="resume" />
    <CardBack
      v-if="state.flippedWord"
      :word="state.flippedWord"
      :kanji="deck.kanji"
      @close="flip(state.flippedWord)"
    />
    <GameBoard v-else :state="state" :now-ms="nowMs" :tags="tags" @tap="tap" @flip="flip" />
    <MissedTray :words="state.missedTray" :is-paused="state.pausedAtMs !== null" @flip="flip" />
  </div>
</template>
