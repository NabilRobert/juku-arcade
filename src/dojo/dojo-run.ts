/**
 * The dojo, the game-over mode (D62): questions on what the player already
 * knows (dojo-questions.ts) until three lanterns are out. A miss puts one
 * out; the score is the right answers, so the run ends on mistakes, not
 * when the player tires, and its board compares knowledge.
 *
 * There's no timer (D69, playtest decision 2026-11-26: "no timer on
 * practice mode thats just cruel"). An earlier version had one that
 * tightened through five stages.
 */

export const LANTERNS = 3;

export type QuestionKind = 'word' | 'kanji' | 'grammar';

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

/** The run after an answer. The last lantern out ends it. */
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

/** End run: the run is over at once, its score kept, as if the last lantern went out. */
export function endedEarly(state: DojoState): DojoState {
  return { ...state, isOver: true };
}
