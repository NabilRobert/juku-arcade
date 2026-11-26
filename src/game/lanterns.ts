/**
 * Lanterns (提灯): the lives in a run that ends on mistakes. Practice mode
 * puts one out for each miss (dojo-run.ts); kanji mode puts one out for
 * each kanji left with readings unfound (useKanjiSheet.ts, D72). The last
 * one out ends the run.
 */

/** Lanterns a run starts with. */
export const LANTERNS = 3;

/** The lanterns still lit after an answer: a failed one puts one out, never below none. */
export function lanternsAfter(lit: number, isFailed: boolean): number {
  return isFailed ? Math.max(0, lit - 1) : lit;
}
