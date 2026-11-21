/**
 * One run of the game as plain data: the set on the board, combo, level,
 * timer, bests and the event log. Every change is a pure function from one
 * state to the next, so the rules (L1–L8) are tested without Vue. Taps live
 * in taps.ts; dealing, timeouts and the timer live here.
 */
import type { DeckWord } from '../deck/types.ts';
import {
  dealSet,
  NO_EXPOSURE,
  type DealtSet,
  type DecoyExposure,
  type RandomSource,
} from './deal.ts';
import { makeEvent, type GameEvent, type SessionIdentity } from './events.ts';
import { FIRST_LEVEL, levelAfterMiss, setDurationMs } from './levels.ts';
import type { SetScore } from './score.ts';
import type { TagTable } from './tags.ts';

export type CardRef = { kind: 'word'; wordId: string } | { kind: 'reading'; index: number };

/** playing: cards can be tapped. cleared: the set's score shows. timedOut: the answers show. */
export type Phase = 'playing' | 'cleared' | 'timedOut';

/** After a wrong tap, the right reading flashes for a moment (L4). */
export interface WrongFlash {
  wordId: string;
  correctIndex: number;
  wrongIndex: number;
  untilMs: number;
}

export interface RunState {
  set: DealtSet;
  setIndex: number;
  setShownAtMs: number;
  setDurationMs: number;
  lastActionAtMs: number;
  phase: Phase;
  selected: CardRef | null;
  matchedWordIds: readonly string[];
  /** Words missed in this set: matching them later isn't clean (L3). */
  missedWordIds: readonly string[];
  cleanMatchTags: readonly number[];
  combo: number;
  level: number;
  bestCombo: number;
  bestSetScore: number;
  lastSetScore: SetScore | null;
  flash: WrongFlash | null;
  decoyExposure: DecoyExposure;
  /** How many times each word has been dealt in this run, for R6's times_seen_before. */
  timesDealt: Readonly<Record<string, number>>;
  events: readonly GameEvent[];
}

/** What a run needs but never changes. */
export interface RunContext {
  pool: readonly DeckWord[];
  tags: TagTable;
  random: RandomSource;
  identity: SessionIdentity;
}

export function secondsLeft(state: RunState, nowMs: number): number {
  return Math.max(0, (state.setShownAtMs + state.setDurationMs - nowMs) / 1000);
}

function withDealtSet(state: RunState, context: RunContext, nowMs: number): RunState {
  const set = dealSet(context.pool, context.random, state.decoyExposure);
  const decoyType = set.readings.find((card) => card.wordId === null)?.decoyType;
  const timesDealt = { ...state.timesDealt };
  for (const word of set.words) timesDealt[word.id] = (timesDealt[word.id] ?? 0) + 1;
  return {
    ...state,
    set,
    setIndex: state.setIndex + 1,
    setShownAtMs: nowMs,
    setDurationMs: setDurationMs(state.level),
    lastActionAtMs: nowMs,
    phase: 'playing',
    selected: null,
    matchedWordIds: [],
    missedWordIds: [],
    cleanMatchTags: [],
    flash: null,
    decoyExposure: decoyType
      ? { ...state.decoyExposure, [decoyType]: state.decoyExposure[decoyType] + 1 }
      : state.decoyExposure,
    timesDealt,
  };
}

export function startRun(context: RunContext, nowMs: number): RunState {
  const empty: RunState = {
    set: { words: [], readings: [] },
    setIndex: -1,
    setShownAtMs: nowMs,
    setDurationMs: 0,
    lastActionAtMs: nowMs,
    phase: 'playing',
    selected: null,
    matchedWordIds: [],
    missedWordIds: [],
    cleanMatchTags: [],
    combo: 0,
    level: FIRST_LEVEL,
    bestCombo: 0,
    bestSetScore: 0,
    lastSetScore: null,
    flash: null,
    decoyExposure: NO_EXPOSURE,
    timesDealt: {},
    events: [
      makeEvent(context.identity, new Date(nowMs), {
        kind: 'session_start',
        level: FIRST_LEVEL,
        set_index: 0,
      }),
    ],
  };
  return withDealtSet(empty, context, nowMs);
}

/** Deals the next set after a cleared or timed-out one. */
export function nextSet(state: RunState, context: RunContext, nowMs: number): RunState {
  if (state.phase === 'playing') return state;
  return withDealtSet(state, context, nowMs);
}

/**
 * When the timer runs out (L6, D4): the combo resets and the level drops as
 * for a miss, but unmatched words are logged as timeouts, never as misses,
 * so the review engine won't treat them as forgotten.
 */
export function timeUp(state: RunState, context: RunContext, nowMs: number): RunState {
  if (state.phase !== 'playing' || secondsLeft(state, nowMs) > 0) return state;
  const unmatched = state.set.words.filter((word) => !state.matchedWordIds.includes(word.id));
  const timeouts = unmatched.map((word) =>
    makeEvent(context.identity, new Date(nowMs), {
      kind: 'timeout',
      level: state.level,
      set_index: state.setIndex,
      word_id: word.id,
      seconds_left: 0,
      cards_left_in_set: unmatched.length,
      tag_shown: context.tags.get(word.id) ?? null,
      times_seen_before: (state.timesDealt[word.id] ?? 1) - 1,
    }),
  );
  return {
    ...state,
    phase: 'timedOut',
    selected: null,
    flash: null,
    combo: 0,
    level: levelAfterMiss(state.level),
    events: [...state.events, ...timeouts],
  };
}
