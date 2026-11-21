<script setup lang="ts">
/**
 * The app shell: loads the player's settings and history from the browser,
 * shows first-launch setup if there are none, then loads the level's deck
 * and starts a run. The game stays mounted (v-show) under the About and
 * Settings pages, and pauses while they cover it.
 */
import { computed, onMounted, ref, shallowRef } from 'vue';
import type { Deck, JlptLevel } from './deck/types.ts';
import type { GameEvent } from './game/events.ts';
import {
  deleteAllData,
  loadEvents,
  loadSettings,
  saveSettings,
  type Settings,
} from './memory/storage.ts';
import AboutData from './components/AboutData.vue';
import GameScreen from './components/GameScreen.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import SetupScreen from './components/SetupScreen.vue';

type Page = 'game' | 'about' | 'settings';

const settings = shallowRef<Settings | null>(null);
const deck = shallowRef<Deck | null>(null);
const pastEvents = shallowRef<readonly GameEvent[]>([]);
const isLoaded = ref(false);
const loadError = ref<string | null>(null);
const page = ref<Page>('game');
/** Changes whenever the run must start over: a new level, or deleted data. */
const runKey = ref(0);
const isAway = computed(() => page.value !== 'game');

/** Storage can be blocked (a private window); the game then runs without saving. */
async function orFallback<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.warn('Browser storage is unavailable; progress will not be saved:', error);
    return fallback;
  }
}

async function loadDeck(level: JlptLevel): Promise<Deck> {
  const url = `${import.meta.env.BASE_URL}decks/${level.toLowerCase()}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Couldn't load the ${level} deck (HTTP ${response.status}): run \`npm run decks\`.`,
    );
  }
  return (await response.json()) as Deck;
}

async function startGame(current: Settings): Promise<void> {
  try {
    pastEvents.value = await orFallback(loadEvents, []);
    deck.value = await loadDeck(current.level);
    settings.value = current;
    runKey.value += 1;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
}

async function useSettings(updated: Settings): Promise<void> {
  await orFallback(() => saveSettings(updated), undefined);
  page.value = 'game';
  await startGame(updated);
}

function finishSetup(level: JlptLevel, classCode: string | null): Promise<void> {
  const fresh = { playerId: crypto.randomUUID(), level, classCode, bestCombo: 0, bestSetScore: 0 };
  return useSettings(fresh);
}

function changeLevel(level: JlptLevel): Promise<void> | undefined {
  if (settings.value === null) return undefined;
  return useSettings({ ...settings.value, level });
}

async function deleteData(): Promise<void> {
  await orFallback(deleteAllData, undefined);
  settings.value = null;
  deck.value = null;
  page.value = 'game';
}

onMounted(async () => {
  const saved = await orFallback(loadSettings, null);
  isLoaded.value = true;
  if (saved) await startGame(saved);
});
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-6">
    <h1 class="text-center text-2xl font-bold tracking-wide">juku-arcade</h1>
    <p v-if="loadError" role="alert" class="text-center text-rose-300">{{ loadError }}</p>
    <SetupScreen v-else-if="isLoaded && !settings" @start="finishSetup" />
    <template v-else-if="settings && deck">
      <AboutData v-if="page === 'about'" @close="page = 'game'" />
      <SettingsPanel
        v-if="page === 'settings'"
        :settings="settings"
        @change-level="changeLevel"
        @delete-data="deleteData"
        @close="page = 'game'"
      />
      <GameScreen
        v-show="!isAway"
        :key="runKey"
        :deck="deck"
        :settings="settings"
        :past-events="pastEvents"
        :is-away="isAway"
      />
    </template>
    <p v-else class="text-center text-slate-400">Loading…</p>
    <footer
      v-if="settings && page === 'game'"
      class="mt-auto flex justify-center gap-6 text-sm text-slate-400"
    >
      <button type="button" class="underline" @click="page = 'settings'">Settings</button>
      <button type="button" class="underline" @click="page = 'about'">About the data</button>
    </footer>
  </main>
</template>
