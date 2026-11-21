<script setup lang="ts">
/**
 * The app shell: loads the N5 deck, starts a run, and switches between the
 * game and the "About the data" page. Level choice arrives in slice 3.
 * The game stays mounted (v-show) under the About page, so the run survives;
 * slice 2's pause will stop its clock there.
 */
import { onMounted, ref } from 'vue';
import type { Deck, DeckWord } from './deck/types.ts';
import AboutData from './components/AboutData.vue';
import GameScreen from './components/GameScreen.vue';

const DECK_URL = `${import.meta.env.BASE_URL}decks/n5.json`;

const deckWords = ref<readonly DeckWord[] | null>(null);
const loadError = ref<string | null>(null);
const isShowingAbout = ref(false);

async function loadDeck(): Promise<Deck> {
  const response = await fetch(DECK_URL);
  if (!response.ok) {
    throw new Error(`Couldn't load the N5 deck (HTTP ${response.status}): run \`npm run decks\`.`);
  }
  return (await response.json()) as Deck;
}

onMounted(async () => {
  try {
    deckWords.value = (await loadDeck()).words;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-6">
    <h1 class="text-center text-2xl font-bold tracking-wide">juku-arcade</h1>
    <AboutData v-if="isShowingAbout" @close="isShowingAbout = false" />
    <p v-if="loadError" role="alert" class="text-center text-rose-300">{{ loadError }}</p>
    <GameScreen v-else-if="deckWords" v-show="!isShowingAbout" :words="deckWords" />
    <p v-else class="text-center text-slate-400">Loading the deck…</p>
    <footer class="mt-auto text-center text-sm text-slate-400">
      <button v-if="!isShowingAbout" type="button" class="underline" @click="isShowingAbout = true">
        About the data
      </button>
    </footer>
  </main>
</template>
