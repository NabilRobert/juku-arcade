<script setup lang="ts">
/**
 * The screen of the mode being played, picked by `mode`: word mode, kanji
 * mode (D37), Bunpou (D56) or practice mode (D62). Split out of App.vue,
 * which only decides which page shows. A new `runKey` remounts the screen,
 * so the run starts over (a new level, or deleted data). The parent's
 * v-show and class reach the screen's root.
 */
import type { Deck } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import type { PlayMode } from '../memory/play-log.ts';
import type { Settings } from '../memory/storage.ts';
import { BunpouScreen, DojoScreen, KanjiScreen } from '../lazy-screens.ts';
import GameScreen from './words/GameScreen.vue';

defineProps<{
  mode: PlayMode;
  runKey: number;
  deck: Deck;
  settings: Settings;
  pastEvents: readonly GameEvent[];
  /** The grammar log (D57), for Bunpou. */
  pastGrammarEvents: readonly GrammarEvent[];
  /** True while another page covers the game: the run pauses. */
  isAway: boolean;
}>();
const emit = defineEmits<{ leave: []; again: [mode: PlayMode] }>();
</script>

<template>
  <KanjiScreen
    v-if="mode === 'kanji'"
    :key="`kanji-${runKey}`"
    :deck="deck"
    :settings="settings"
    :is-away="isAway"
    @leave="emit('leave')"
    @again="emit('again', 'kanji')"
  />
  <DojoScreen
    v-else-if="mode === 'dojo'"
    :key="`dojo-${runKey}`"
    :deck="deck"
    :settings="settings"
    :is-away="isAway"
    @leave="emit('leave')"
    @again="emit('again', 'dojo')"
  />
  <BunpouScreen
    v-else-if="mode === 'bunpou'"
    :key="`bunpou-${runKey}`"
    :level="deck.level"
    :settings="settings"
    :past-grammar-events="pastGrammarEvents"
    :is-away="isAway"
    @leave="emit('leave')"
    @again="emit('again', 'bunpou')"
  />
  <GameScreen
    v-else
    :key="`words-${runKey}`"
    :deck="deck"
    :settings="settings"
    :past-events="pastEvents"
    :is-away="isAway"
    @leave="emit('leave')"
  />
</template>
