/**
 * Pause and flip (L9, decision D8). Pausing stops the clock and hides the
 * card faces; while paused, the player can flip a word card, or a card in
 * the missed tray, to see its back: meaning, example and kanji readings.
 *
 * Flipping an unmatched card on the board is a peek: the word then scores
 * nothing when matched, comes back soon (R3), and counts as a miss for the
 * review engine. Tray cards are past misses, so flipping them is free.
 */
import type { DeckWord } from '../deck/types.ts';
import { withComeback } from './comebacks.ts';
import { makeEvent } from './events.ts';
import type { RunContext, RunState } from './run.ts';

function pauseEvent(state: RunState, context: RunContext, nowMs: number, kind: 'pause' | 'resume') {
  return makeEvent(context.identity, new Date(nowMs), {
    kind,
    level: state.level,
    set_index: state.setIndex,
  });
}

export function pause(state: RunState, context: RunContext, nowMs: number): RunState {
  if (state.phase !== 'playing' || state.pausedAtMs !== null) return state;
  return {
    ...state,
    pausedAtMs: nowMs,
    selected: null,
    events: [...state.events, pauseEvent(state, context, nowMs, 'pause')],
  };
}

/** Resumes play, moving the set's clock on by the time spent paused. */
export function resume(state: RunState, context: RunContext, nowMs: number): RunState {
  if (state.pausedAtMs === null) return state;
  const pausedMs = nowMs - state.pausedAtMs;
  return {
    ...state,
    pausedAtMs: null,
    flippedWord: null,
    setShownAtMs: state.setShownAtMs + pausedMs,
    lastActionAtMs: state.lastActionAtMs + pausedMs,
    flash: state.flash ? { ...state.flash, untilMs: state.flash.untilMs + pausedMs } : null,
    events: [...state.events, pauseEvent(state, context, nowMs, 'resume')],
  };
}

function isPeek(state: RunState, word: DeckWord): boolean {
  const isOnBoard = state.set.words.some((candidate) => candidate.id === word.id);
  const isMatched = state.matchedWordIds.includes(word.id);
  return isOnBoard && !isMatched && !state.peekedWordIds.includes(word.id);
}

function withPeek(state: RunState, context: RunContext, word: DeckWord, nowMs: number): RunState {
  const event = makeEvent(context.identity, new Date(nowMs), {
    kind: 'peek',
    level: state.level,
    set_index: state.setIndex,
    word_id: word.id,
    tag_shown: context.tags.get(word.id) ?? null,
    cards_left_in_set: state.set.words.length - state.matchedWordIds.length,
    times_seen_before: (state.timesDealt[word.id] ?? 1) - 1,
  });
  return {
    ...state,
    peekedWordIds: [...state.peekedWordIds, word.id],
    comebackWordIds: withComeback(state.comebackWordIds, word.id),
    events: [...state.events, event],
  };
}

/** Shows a card's back while paused; flipping the same card again turns it back over. */
export function flipCard(
  state: RunState,
  context: RunContext,
  word: DeckWord,
  nowMs: number,
): RunState {
  if (state.pausedAtMs === null) return state;
  if (state.flippedWord?.id === word.id) return { ...state, flippedWord: null };
  const peeked = isPeek(state, word) ? withPeek(state, context, word, nowMs) : state;
  return { ...peeked, flippedWord: word };
}
