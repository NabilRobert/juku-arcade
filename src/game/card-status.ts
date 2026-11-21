/**
 * How each card looks right now: selected, matched, flashing wrong or
 * right after a miss, or idle. Pure functions of the run state and the
 * clock, so the board component only draws what these return.
 */
import type { RunState } from './run.ts';

/** 'hidden': the card shows its back while the game is paused (D8). */
export type CardStatus = 'idle' | 'selected' | 'matched' | 'wrong' | 'correct' | 'hidden';

function isFlashing(state: RunState, nowMs: number): boolean {
  return state.flash !== null && nowMs < state.flash.untilMs;
}

export function wordCardStatus(state: RunState, wordId: string, nowMs: number): CardStatus {
  if (state.matchedWordIds.includes(wordId)) return 'matched';
  if (state.pausedAtMs !== null) return 'hidden';
  if (isFlashing(state, nowMs) && state.flash?.wordId === wordId) return 'wrong';
  const selected = state.selected;
  return selected?.kind === 'word' && selected.wordId === wordId ? 'selected' : 'idle';
}

/** During a wrong-tap flash: the right reading is 'correct', the one picked is 'wrong'. */
function readingFlashStatus(state: RunState, index: number, nowMs: number): CardStatus | null {
  const flash = state.flash;
  if (flash === null || !isFlashing(state, nowMs)) return null;
  if (flash.correctIndex === index) return 'correct';
  return flash.wrongIndex === index ? 'wrong' : null;
}

function isReadingMatched(state: RunState, index: number): boolean {
  const wordId = state.set.readings[index]?.wordId ?? null;
  return wordId !== null && state.matchedWordIds.includes(wordId);
}

export function readingCardStatus(state: RunState, index: number, nowMs: number): CardStatus {
  if (isReadingMatched(state, index)) return 'matched';
  if (state.pausedAtMs !== null) return 'hidden';
  const flashStatus = readingFlashStatus(state, index, nowMs);
  if (flashStatus !== null) return flashStatus;
  const selected = state.selected;
  return selected?.kind === 'reading' && selected.index === index ? 'selected' : 'idle';
}
