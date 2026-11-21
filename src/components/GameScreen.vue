<script setup lang="ts">
/**
 * One run on screen: the HUD, then the board (or a flipped card's back
 * while paused), then the missed tray. Driven by useRun.
 */
import { watch } from 'vue';
import type { Deck } from '../deck/types.ts';
import { useRun } from '../composables/useRun.ts';
import CardBack from './CardBack.vue';
import GameBoard from './GameBoard.vue';
import GameHud from './GameHud.vue';
import MissedTray from './MissedTray.vue';

const props = defineProps<{
  deck: Deck;
  /** True while another page (About the data) covers the game: it pauses. */
  isAway: boolean;
}>();
const { state, nowMs, tags, tap, pause, resume, flip } = useRun(props.deck.words);

watch(
  () => props.isAway,
  (isAway) => {
    if (isAway) pause();
  },
);
</script>

<template>
  <div class="flex flex-col gap-6">
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
