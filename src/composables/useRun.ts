/**
 * Connects a run (src/game/run.ts) to Vue and to the player's memory:
 * holds the state, ticks the clock, ends timed-out sets, deals the next set
 * from the review engine's pool, and saves every new event to IndexedDB.
 * The rules stay in src/game/ and src/memory/; this file only drives them.
 */
import { onUnmounted, ref, shallowRef, type Ref, type ShallowRef } from 'vue';
import type { DeckWord } from '../deck/types.ts';
import { localDay, type GameEvent } from '../game/events.ts';
import { flipCard, pause, resume } from '../game/pause.ts';
import { nextSet, startRun, timeUp, type RunContext, type RunState } from '../game/run.ts';
import type { TagTable } from '../game/tags.ts';
import { throwReading } from '../game/taps.ts';
import { CLEARED_PAUSE_MS, TIMED_OUT_PAUSE_MS } from '../game/tuning.ts';
import { tickPlayClock, withPlayTime, type PlayClock } from '../game/wellbeing.ts';
import { createLocalEngine, type Progress, type ReviewEngine } from '../memory/review-engine.ts';
import { appendEvents, saveSettings, type Settings } from '../memory/storage.ts';

/** Often enough for a smooth timer bar, rarely enough to stay cheap on phones. */
const TICK_MS = 100;

export interface RunSetup {
  words: readonly DeckWord[];
  settings: Settings;
  pastEvents: readonly GameEvent[];
}

const today = (): string => localDay(new Date());

/** Leaving the tab pauses the game, so the clock never runs while nobody is looking. */
function usePauseWhenHidden(pauseRun: () => void): void {
  const pauseWhenHidden = (): void => {
    if (document.visibilityState === 'hidden') pauseRun();
  };
  document.addEventListener('visibilitychange', pauseWhenHidden);
  onUnmounted(() => document.removeEventListener('visibilitychange', pauseWhenHidden));
}

/** The context for the next deal: a fresh pool and fresh learned tags. */
function refreshed(context: RunContext, engine: ReviewEngine): RunContext {
  return { ...context, pool: engine.recommendWords(today(), context.random), tags: engine.tags() };
}

/**
 * Hands events the engine hasn't seen to it and to IndexedDB. Storage can
 * fail (a private window, blocked site data); the game then keeps working
 * from memory for this visit.
 */
function syncEvents(state: RunState, syncedCount: number, engine: ReviewEngine): number {
  const fresh = state.events.slice(syncedCount);
  if (fresh.length === 0) return syncedCount;
  engine.recordEvents(fresh);
  appendEvents(fresh).catch((error: unknown) => console.warn('Could not save events:', error));
  return state.events.length;
}

/** Saves a new best combo or best set score, so they survive the visit (L12). */
function saveBests(state: RunState, settings: Settings): Settings {
  const isBetter =
    state.bestCombo > settings.bestCombo || state.bestSetScore > settings.bestSetScore;
  if (!isBetter) return settings;
  const updated = { ...settings, bestCombo: state.bestCombo, bestSetScore: state.bestSetScore };
  saveSettings(updated).catch((error: unknown) => console.warn('Could not save bests:', error));
  return updated;
}

/** The parts of a run that change outside the pure game state. */
interface Driver {
  engine: ReviewEngine;
  settings: Settings;
  context: RunContext;
  syncedCount: number;
  setEndedAtMs: number | null;
  clock: PlayClock;
}

/** The Vue state a run shows. */
interface RunView {
  state: ShallowRef<RunState>;
  nowMs: Ref<number>;
  tags: ShallowRef<TagTable>;
  progress: ShallowRef<Progress>;
  /** W1: play in this sitting, not counting pauses. */
  sessionPlayMs: Ref<number>;
  /** W2: play today, across sittings. */
  playMsToday: Ref<number>;
}

function createDriver(setup: RunSetup): Driver {
  const engine = createLocalEngine(setup.words, setup.pastEvents);
  const { settings } = setup;
  const base: RunContext = {
    pool: [],
    tags: new Map(),
    random: Math.random,
    identity: {
      playerId: settings.playerId,
      sessionId: crypto.randomUUID(),
      classCode: settings.classCode,
    },
    historyOf: (wordId) => engine.history(wordId, today()),
  };
  return {
    engine,
    settings,
    context: refreshed(base, engine),
    syncedCount: 0,
    setEndedAtMs: null,
    clock: { lastTickMs: Date.now(), lastSaveMs: Date.now() },
  };
}

function afterChange(driver: Driver, view: RunView): void {
  driver.syncedCount = syncEvents(view.state.value, driver.syncedCount, driver.engine);
  driver.settings = saveBests(view.state.value, driver.settings);
  view.progress.value = driver.engine.getProgress(today());
}

/** Once a set has ended, waits out its pause, then deals from a fresh pool. */
function dealNextSetAfterPause(driver: Driver, view: RunView): void {
  const nowMs = view.nowMs.value;
  driver.setEndedAtMs ??= nowMs;
  const pauseMs = view.state.value.phase === 'timedOut' ? TIMED_OUT_PAUSE_MS : CLEARED_PAUSE_MS;
  if (nowMs - driver.setEndedAtMs < pauseMs) return;
  driver.setEndedAtMs = null;
  driver.context = refreshed(driver.context, driver.engine);
  view.tags.value = driver.context.tags;
  view.state.value = nextSet(view.state.value, driver.context, nowMs);
}

/** Counts play time while the game isn't paused (W1, W2), and saves it now and then. */
function countPlayTime(driver: Driver, view: RunView): void {
  const now = { ms: view.nowMs.value, day: today() };
  const isPaused = view.state.value.pausedAtMs !== null;
  const played = tickPlayClock(driver.clock, driver.settings, now, isPaused);
  driver.clock = played.clock;
  driver.settings = played.record;
  view.sessionPlayMs.value += played.playedMs;
  view.playMsToday.value = driver.settings.playMsToday;
  if (!played.isSaveDue) return;
  saveSettings(driver.settings).catch((error: unknown) =>
    console.warn('Could not save play time:', error),
  );
}

function tick(driver: Driver, view: RunView): void {
  view.nowMs.value = Date.now();
  countPlayTime(driver, view);
  view.state.value = timeUp(view.state.value, driver.context, view.nowMs.value);
  if (view.state.value.phase !== 'playing') dealNextSetAfterPause(driver, view);
  afterChange(driver, view);
}

export function useRun(setup: RunSetup) {
  const driver = createDriver(setup);
  const view: RunView = {
    state: shallowRef(startRun(driver.context, Date.now(), driver.settings)),
    nowMs: ref(Date.now()),
    tags: shallowRef(driver.context.tags),
    progress: shallowRef(driver.engine.getProgress(today())),
    sessionPlayMs: ref(0),
    playMsToday: ref(withPlayTime(driver.settings, today(), 0).playMsToday),
  };
  const act = (change: (current: RunState, context: RunContext) => RunState): void => {
    view.state.value = change(view.state.value, driver.context);
    afterChange(driver, view);
  };
  const timer = setInterval(() => tick(driver, view), TICK_MS);
  onUnmounted(() => clearInterval(timer));
  usePauseWhenHidden(() => act((current, context) => pause(current, context, Date.now())));
  return {
    ...view,
    throwReading: (readingIndex: number, wordId: string) =>
      act((current, context) => throwReading(current, context, readingIndex, wordId, Date.now())),
    pause: () => act((current, context) => pause(current, context, Date.now())),
    /** Banking the pot ends the combo (the bank run). */
    endCombo: () => act((current) => ({ ...current, combo: 0 })),
    resume: () => act((current, context) => resume(current, context, Date.now())),
    flip: (word: DeckWord) =>
      act((current, context) => flipCard(current, context, word, Date.now())),
  };
}
