/**
 * One word's long-term memory state, and how an answer changes it (R2).
 *
 * Ported from Juku's review engine (NabilRobert/juku-agents-ai,
 * packages/juku-data/src/juku_data/engine/state.py, after_quiz_answer, at
 * commit 4e6c409), so the game can move to Juku's API later without its
 * scheduling changing. Two deliberate differences:
 * - every word the player answers enters the boxes (in Juku only mistakes
 *   do), because the daily deck is built from them;
 * - a word moves up at most once per local day, so extra play the same day
 *   can't skip the spacing (decision D10).
 */
import { addDays } from './days.ts';

/** LE6: Leitner boxes 1–5; a word waits this many days before it's due again. */
export const LEITNER_INTERVAL_DAYS: Readonly<Record<number, number>> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
};
export const FIRST_BOX = 1;
export const LAST_BOX = 5;

/** LE1: a word is known after correct answers on this many separate local days. */
export const CORRECT_DAYS_TO_KNOW = 2;

export interface LeitnerState {
  isKnown: boolean;
  correctDays: number;
  /** Local dates as YYYY-MM-DD, in the player's own timezone. */
  lastCorrectDay: string | null;
  box: number | null;
  dueDay: string | null;
}

export const NEW_WORD: LeitnerState = {
  isKnown: false,
  correctDays: 0,
  lastCorrectDay: null,
  box: null,
  dueDay: null,
};

function nextBox(state: LeitnerState, isCorrect: boolean, day: string): number {
  if (!isCorrect) return FIRST_BOX;
  if (state.box === null) return FIRST_BOX;
  const alreadyMovedToday = state.lastCorrectDay === day;
  return alreadyMovedToday ? state.box : Math.min(state.box + 1, LAST_BOX);
}

export function afterAnswer(state: LeitnerState, isCorrect: boolean, day: string): LeitnerState {
  const box = nextBox(state, isCorrect, day);
  const isNewCorrectDay = isCorrect && state.lastCorrectDay !== day;
  const correctDays = state.correctDays + (isNewCorrectDay ? 1 : 0);
  return {
    isKnown: state.isKnown || correctDays >= CORRECT_DAYS_TO_KNOW,
    correctDays,
    lastCorrectDay: isCorrect ? day : state.lastCorrectDay,
    box,
    dueDay: addDays(day, LEITNER_INTERVAL_DAYS[box] ?? 1),
  };
}
