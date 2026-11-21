/**
 * Connects a run (src/game/run.ts) to Vue: holds the state, ticks the clock,
 * ends sets when time runs out, and deals the next set after a short pause.
 * The rules stay in src/game/; this file only drives them.
 */
import { onUnmounted, ref, shallowRef } from 'vue';
import type { DeckWord } from '../deck/types.ts';
import { flipCard, pause, resume } from '../game/pause.ts';
import { nextSet, startRun, timeUp, type CardRef, type RunContext } from '../game/run.ts';
import { tagsByRank } from '../game/tags.ts';
import { tapCard } from '../game/taps.ts';
import { CLEARED_PAUSE_MS, TIMED_OUT_PAUSE_MS } from '../game/tuning.ts';

/** Often enough for a smooth timer bar, rarely enough to stay cheap on phones. */
const TICK_MS = 100;

/** Leaving the tab pauses the game, so the clock never runs while nobody is looking. */
function usePauseWhenHidden(pauseRun: () => void): void {
  const pauseWhenHidden = (): void => {
    if (document.visibilityState === 'hidden') pauseRun();
  };
  document.addEventListener('visibilitychange', pauseWhenHidden);
  onUnmounted(() => document.removeEventListener('visibilitychange', pauseWhenHidden));
}

export function useRun(words: readonly DeckWord[]) {
  const context: RunContext = {
    pool: words,
    tags: tagsByRank(words),
    random: Math.random,
    identity: { playerId: crypto.randomUUID(), sessionId: crypto.randomUUID() },
  };
  const state = shallowRef(startRun(context, Date.now()));
  const nowMs = ref(Date.now());
  let setEndedAtMs: number | null = null;

  function tick(): void {
    nowMs.value = Date.now();
    state.value = timeUp(state.value, context, nowMs.value);
    if (state.value.phase === 'playing') return;
    setEndedAtMs ??= nowMs.value;
    const pauseMs = state.value.phase === 'timedOut' ? TIMED_OUT_PAUSE_MS : CLEARED_PAUSE_MS;
    if (nowMs.value - setEndedAtMs < pauseMs) return;
    setEndedAtMs = null;
    state.value = nextSet(state.value, context, nowMs.value);
  }

  function tap(card: CardRef): void {
    state.value = tapCard(state.value, context, card, Date.now());
  }

  function pauseRun(): void {
    state.value = pause(state.value, context, Date.now());
  }

  function resumeRun(): void {
    state.value = resume(state.value, context, Date.now());
  }

  function flip(word: DeckWord): void {
    state.value = flipCard(state.value, context, word, Date.now());
  }

  const timer = setInterval(tick, TICK_MS);
  onUnmounted(() => clearInterval(timer));
  usePauseWhenHidden(pauseRun);

  return { state, nowMs, tags: context.tags, tap, pause: pauseRun, resume: resumeRun, flip };
}
