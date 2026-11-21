<script setup lang="ts">
/**
 * The app shell: loads the N5 deck, deals one set, and switches between the
 * board and the "About the data" page. Level choice arrives in slice 3.
 */
import { onMounted, ref } from 'vue';
import type { Deck } from './deck/types.ts';
import { dealSet, type DealtSet } from './game/deal.ts';
import AboutData from './components/AboutData.vue';
import GameBoard from './components/GameBoard.vue';

const DECK_URL = `${import.meta.env.BASE_URL}decks/n5.json`;

const dealtSet = ref<DealtSet | null>(null);
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
    dealtSet.value = dealSet((await loadDeck()).words);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
});
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-6">
    <h1 class="text-center text-2xl font-bold tracking-wide">juku-arcade</h1>
    <AboutData v-if="isShowingAbout" @close="isShowingAbout = false" />
    <p v-else-if="loadError" role="alert" class="text-center text-rose-300">{{ loadError }}</p>
    <GameBoard v-else-if="dealtSet" :set="dealtSet" />
    <p v-else class="text-center text-slate-400">Dealing…</p>
    <footer class="mt-auto text-center text-sm text-slate-400">
      <button v-if="!isShowingAbout" type="button" class="underline" @click="isShowingAbout = true">
        About the data
      </button>
    </footer>
  </main>
</template>
