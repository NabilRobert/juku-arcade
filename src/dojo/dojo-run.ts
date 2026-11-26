/**
 * The dojo, the game-over mode (D62): quick questions on what the player
 * already knows (dojo-questions.ts) until three lanterns are out. A miss or
 * a timeout puts one out; the score is the right answers, so the run ends
 * on mistakes, not when the player tires, and its board compares skill.
 *
 * The timer tightens every RIGHT_PER_STAGE right answers through five
 * stages, then holds at the fifth, a floor sized for a slow reader who
 * knows the answer (playtest decision, 2026-11-26: the game should help
 * people learn, not shut out slow readers).
 */

export const LANTERNS = 3;
export const RIGHT_PER_STAGE = 10;

export type QuestionKind = 'word' | 'kanji' | 'grammar';

/** Seconds per question at stages 1 to 5. A grammar sentence's time is the whole sentence's. */
export const STAGE_SECONDS: Readonly<Record<QuestionKind, readonly number[]>> = {
  word: [20, 17, 15, 13, 12],
  kanji: [60, 52, 45, 40, 36],
  grammar: [30, 26, 23, 20, 18],
};
const STAGE_COUNT = 5;

export interface DojoState {
  lanterns: number;
  right: number;
  answered: number;
  /** Right answers in a row now, and the most in a row this run. */
  combo: number;
  bestCombo: number;
  isOver: boolean;
}

export const FRESH_DOJO: DojoState = {
  lanterns: LANTERNS,
  right: 0,
  answered: 0,
  combo: 0,
  bestCombo: 0,
  isOver: false,
};

/** The stage, 1 to 5, after this many right answers. */
export function stageOf(right: number): number {
  return Math.min(Math.floor(right / RIGHT_PER_STAGE), STAGE_COUNT - 1) + 1;
}

export function secondsFor(kind: QuestionKind, right: number): number {
  const seconds = STAGE_SECONDS[kind];
  return seconds[stageOf(right) - 1] ?? seconds.at(-1) ?? 0;
}

/** The run after an answer; a timeout is a wrong answer. The last lantern out ends it. */
export function afterAnswer(state: DojoState, isRight: boolean): DojoState {
  if (state.isOver) return state;
  const lanterns = isRight ? state.lanterns : state.lanterns - 1;
  const combo = isRight ? state.combo + 1 : 0;
  return {
    lanterns,
    right: state.right + (isRight ? 1 : 0),
    answered: state.answered + 1,
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    isOver: lanterns <= 0,
  };
}
