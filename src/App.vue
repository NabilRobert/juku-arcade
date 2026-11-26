<script setup lang="ts">
/**
 * The app shell: loads the player's settings and history from the browser,
 * shows first-launch setup if there are none, then loads the level's deck
 * and starts a run. The game stays mounted (v-show) under the About and
 * Settings pages, and pauses while they cover it. Screens other than the
 * start screen and word mode load on demand (lazy-screens.ts).
 */
import { domMax, LazyMotion, MotionConfig } from 'motion-v';
import { computed, onMounted, ref, shallowRef } from 'vue';
import type { Deck, JlptLevel } from './deck/types.ts';
import { localDay, type GameEvent } from './game/events.ts';
import type { GrammarEvent } from './grammar/grammar-events.ts';
import { pickQuestions } from './memory/check-up-questions.ts';
import type { Question } from './memory/check-up.ts';
import { buildExport, downloadExport } from './memory/export.ts';
import { deriveMemory } from './memory/word-memory.ts';
import {
  appendEvents,
  deleteAllData,
  loadEvents,
  loadGrammarEvents,
  loadSettings,
  saveSettings,
  type Settings,
} from './memory/storage.ts';
import { provideGoToPage, type PageTarget } from './composables/usePageLinks.ts';
import { usePhoneLandscape } from './composables/usePhoneLandscape.ts';
import type { PlayMode } from './memory/play-log.ts';
import AppFooter from './components/AppFooter.vue';
import RotateNotice from './components/ui/RotateNotice.vue';
import CheckUpScreen from './components/CheckUpScreen.vue';
import GameScreen from './components/words/GameScreen.vue';
import ModePicker from './components/ModePicker.vue';
import SetupScreen from './components/SetupScreen.vue';
import TableBackground from './components/TableBackground.vue';
import PixelSeal from './components/ui/PixelSeal.vue';
import {
  AboutData,
  BunpouScreen,
  DojoScreen,
  KanjiScreen,
  prefetchScreens,
  ResearchPage,
  SettingsPanel,
  StatsPage,
} from './lazy-screens.ts';

type Page = 'game' | 'about' | 'research' | 'settings' | 'checkUp' | 'mode' | 'stats';

const settings = shallowRef<Settings | null>(null);
const deck = shallowRef<Deck | null>(null);
const pastEvents = shallowRef<readonly GameEvent[]>([]);
/** The grammar log (D57), read again each time Bunpou starts so it sees the last run's answers. */
const grammarEvents = shallowRef<readonly GrammarEvent[]>([]);
const isLoaded = ref(false);
const loadError = ref<string | null>(null);
const page = ref<Page>('game');
/** Word mode, kanji mode (D37), Bunpou (D56) or the dojo (D62), picked on the start screen each time. */
const mode = ref<PlayMode>('words');
/** Changes whenever the run must start over: a new level, or deleted data. */
const runKey = ref(0);
const isPhoneLandscape = usePhoneLandscape();
/** True while the game is covered: another page is open, or a phone is turned sideways. The run pauses. */
const isAway = computed(() => page.value !== 'game' || isPhoneLandscape.value);
const checkUpQuestions = shallowRef<readonly Question[]>([]);
const checkUpIdentity = computed(() => ({
  playerId: settings.value?.playerId ?? '',
  sessionId: `check-up-${runKey.value}`,
  classCode: settings.value?.classCode ?? null,
}));

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
    grammarEvents.value = await orFallback(loadGrammarEvents, []);
    deck.value = await loadDeck(current.level);
    settings.value = current;
    offerCheckUp(current, deck.value);
    if (page.value !== 'checkUp') page.value = 'mode';
    runKey.value += 1;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error);
  }
}

/** C1: offers the check-up once a day, when there's something to ask. */
function offerCheckUp(current: Settings, levelDeck: Deck): void {
  const today = localDay(new Date());
  if (current.checkUpOfferedDay === today) return;
  const questions = pickQuestions(
    levelDeck.words,
    deriveMemory(pastEvents.value),
    today,
    Math.random,
  );
  if (questions.length === 0) return;
  checkUpQuestions.value = questions;
  page.value = 'checkUp';
}

/** After the check-up (or skipping it): saves its answers, then starts the game with them. */
async function finishCheckUp(answers: readonly GameEvent[]): Promise<void> {
  if (settings.value === null) return;
  const updated = { ...settings.value, checkUpOfferedDay: localDay(new Date()) };
  await orFallback(() => saveSettings(updated), undefined);
  await orFallback(() => appendEvents(answers), undefined);
  pastEvents.value = [...pastEvents.value, ...answers];
  settings.value = updated;
  page.value = 'mode';
}

/**
 * Starts the chosen mode. Settings are read again first: the mode that
 * just closed saved today's play time, and the next one must count on
 * from it (W2).
 */
/** Opens the stats page with the latest events and settings, saved since the game started. */
async function openStats(): Promise<void> {
  pastEvents.value = await orFallback(loadEvents, pastEvents.value);
  grammarEvents.value = await orFallback(loadGrammarEvents, grammarEvents.value);
  const latest = await orFallback(loadSettings, null);
  if (latest) settings.value = latest;
  page.value = 'stats';
}

/** A footer link: the stats page loads the latest first; the rest just open. */
/** Where a page opened from the footer or the drawer goes back to: the game, or the start screen. */
const returnPage = ref<Page>('game');

function goTo(target: PageTarget): void {
  if (target !== 'mode' && (page.value === 'game' || page.value === 'mode')) {
    returnPage.value = page.value;
  }
  if (target === 'stats') void openStats();
  else page.value = target;
}

function closePage(): void {
  page.value = returnPage.value;
}
provideGoToPage(goTo);

async function chooseMode(next: PlayMode): Promise<void> {
  const latest = await orFallback(loadSettings, null);
  if (latest) settings.value = latest;
  if (next === 'bunpou') grammarEvents.value = await orFallback(loadGrammarEvents, []);
  mode.value = next;
  page.value = 'game';
  runKey.value += 1;
}

/** A1: downloads this browser's word and grammar events as an anonymous file. */
async function exportData(): Promise<void> {
  if (settings.value === null) return;
  const events = await orFallback(loadEvents, pastEvents.value);
  const grammar = await orFallback(loadGrammarEvents, grammarEvents.value);
  downloadExport(buildExport(events, settings.value, new Date(), grammar));
}

/** A level change (or other settings) restarts the game on the start screen, with the new deck. */
async function useSettings(updated: Settings): Promise<void> {
  await orFallback(() => saveSettings(updated), undefined);
  await startGame(updated);
}

function finishSetup(level: JlptLevel, classCode: string | null): Promise<void> {
  const fresh: Settings = {
    playerId: crypto.randomUUID(),
    level,
    classCode,
    bestCombo: 0,
    playDay: null,
    playMsToday: 0,
    checkUpOfferedDay: null,
  };
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
  prefetchScreens();
});
</script>

<template>
  <!-- Motion's bundle with drag, for throwing cards; "user" follows the system's reduce-motion setting. -->
  <LazyMotion :features="domMax">
    <MotionConfig reduced-motion="user">
      <TableBackground />
      <RotateNotice v-if="isPhoneLandscape" />
      <!-- Clipped, so cards dealt up from under the screen never make the page scrollable mid-deal;
           clip, unlike hidden, makes no scroll box, so the side panel stays sticky. -->
      <main class="flex min-h-svh flex-col gap-4 overflow-clip px-4 py-4 sm:px-8">
        <h1
          class="flex items-center justify-center gap-3 text-2xl font-bold tracking-wide text-aqua"
        >
          <PixelSeal class="w-9" />
          juku-arcade
        </h1>
        <p v-if="loadError" role="alert" class="text-center text-crimson">{{ loadError }}</p>
        <SetupScreen v-else-if="isLoaded && !settings" @start="finishSetup" />
        <template v-else-if="settings && deck">
          <AboutData v-if="page === 'about'" @close="closePage" />
          <ResearchPage v-if="page === 'research'" @close="closePage" />
          <StatsPage
            v-if="page === 'stats'"
            :deck="deck"
            :settings="settings"
            :events="pastEvents"
            :grammar-events="grammarEvents"
            @close="closePage"
          />
          <SettingsPanel
            v-if="page === 'settings'"
            :settings="settings"
            @change-level="changeLevel"
            @delete-data="deleteData"
            @export-data="exportData"
            @close="closePage"
          />
          <CheckUpScreen
            v-if="page === 'checkUp'"
            :questions="checkUpQuestions"
            :identity="checkUpIdentity"
            @done="finishCheckUp"
            @skip="finishCheckUp([])"
          />
          <!-- A page opened from the start screen keeps it underneath, so no run starts behind the page. -->
          <ModePicker
            v-else-if="page === 'mode' || (page !== 'game' && returnPage === 'mode')"
            v-show="page === 'mode'"
            :key="`menu-${runKey}`"
            :deck="deck"
            @choose="chooseMode"
          />
          <KanjiScreen
            v-else-if="mode === 'kanji'"
            v-show="!isAway"
            :key="`kanji-${runKey}`"
            class="my-auto"
            :deck="deck"
            :settings="settings"
            :is-away="isAway"
            @leave="page = 'mode'"
            @again="chooseMode('kanji')"
          />
          <DojoScreen
            v-else-if="mode === 'dojo'"
            v-show="!isAway"
            :key="`dojo-${runKey}`"
            class="my-auto"
            :deck="deck"
            :settings="settings"
            :is-away="isAway"
            @leave="page = 'mode'"
            @again="chooseMode('dojo')"
          />
          <BunpouScreen
            v-else-if="mode === 'bunpou'"
            v-show="!isAway"
            :key="`bunpou-${runKey}`"
            class="my-auto"
            :level="deck.level"
            :settings="settings"
            :past-grammar-events="grammarEvents"
            :is-away="isAway"
            @leave="page = 'mode'"
            @again="chooseMode('bunpou')"
          />
          <GameScreen
            v-else
            v-show="!isAway"
            :key="runKey"
            class="my-auto"
            :deck="deck"
            :settings="settings"
            :past-events="pastEvents"
            :is-away="isAway"
            @leave="page = 'mode'"
          />
        </template>
        <p v-else class="text-center text-washi/60">Loading…</p>
        <AppFooter
          :is-in-game="settings !== null && page === 'game'"
          :is-on-start-screen="settings !== null && page === 'mode'"
          @go="goTo"
        />
      </main>
    </MotionConfig>
  </LazyMotion>
</template>
