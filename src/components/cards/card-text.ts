/**
 * How big a card's text is (PlayCard.vue): as big as the card allows,
 * always on one line (one column for a reading). A long word shrinks to
 * fit rather than breaking in two, which read badly (playtest decision,
 * 2026-11-26).
 */

/** Largest text size (rem): short words are big, as on a printed card. */
const MAX_TEXT_REM = { word: 3.5, reading: 2.6 } as const;
/**
 * Share of the card's width (cqw) the text may fill inside the frame:
 * across the card for a word, down it for a reading (the card is 4/3 as
 * tall as it is wide).
 */
const TEXT_LENGTH_CQW = { word: 74, reading: 96 } as const;

export type CardKind = keyof typeof MAX_TEXT_REM;

/** The CSS font size for a card's text: the largest size, or smaller so the whole text fits on one line. */
export function cardFontSize(text: string, kind: CardKind): string {
  const fitted = TEXT_LENGTH_CQW[kind] / Math.max(1, [...text].length);
  return `min(${MAX_TEXT_REM[kind]}rem, ${fitted}cqw)`;
}
