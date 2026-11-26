<script setup lang="ts">
/**
 * The dojo, the game-over mode (D62): reads what the player has met from
 * this browser (real play only, never placeholder play), then starts a
 * run, or says what to play first if there isn't enough to ask yet.
 */
import { computed } from 'vue';
import type { Deck } from '../../deck/types.ts';
import { usePlayHistory } from '../../composables/usePlayHistory.ts';
import { dojoPools, isDojoOpen, MIN_DOJO_WORDS } from '../../dojo/dojo-questions.ts';
import { kanjiPool } from '../../kanji/kanji-round.ts';
import type { Settings } from '../../memory/storage.ts';
import PixelButton from '../ui/PixelButton.vue';
import DojoGame from './DojoGame.vue';

const props = defineProps<{ deck: Deck; settings: Settings; isAway: boolean }>();
const emit = defineEmits<{ leave: []; again: [] }>();

const { history, isLoaded } = usePlayHistory(props.deck, { withSample: false });
const pools = computed(() => dojoPools(props.deck.words, kanjiPool(props.deck), history.value));
</script>

<template>
  <p v-if="!isLoaded" class="text-center text-washi/60">Loading…</p>
  <DojoGame
    v-else-if="isDojoOpen(pools)"
    :pools="pools"
    :level="deck.level"
    :settings="settings"
    :is-away="isAway"
    @leave="emit('leave')"
    @again="emit('again')"
  />
  <section
    v-else
    class="pixel-panel mx-auto flex max-w-lg flex-col items-center gap-4 bg-wood/80 p-8 text-center"
    data-testid="dojo-closed"
  >
    <h2 class="text-2xl font-bold text-aqua">The dojo isn't open yet</h2>
    <p>
      The dojo asks only what you've learned. Match {{ MIN_DOJO_WORDS }} words in Words mode first,
      then come back.
    </p>
    <PixelButton colour="steel" class="px-6 py-2" @click="emit('leave')">Change mode</PixelButton>
  </section>
</template>
