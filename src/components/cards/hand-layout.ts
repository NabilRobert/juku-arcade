/**
 * How cards sit on the table, shared by word mode (GameBoard) and kanji
 * mode (KanjiBoard): slots the size of their card, the hand laid out in
 * one straight, overlapping row, and the gentle float every card has while
 * it waits.
 */

/** Each slot is the size of the card in it (PlayCard draws the card the same size). */
export const SLOT_SIZE = 'mx-auto aspect-[3/4] w-[min(100%,calc(var(--card-height)*0.75))]';

/**
 * The hand is one straight row, each card overlapping the one before it,
 * each turned and raised a touch differently, as cards laid out by hand
 * are. The values repeat for hands longer than the lists.
 */
const HAND_TILTS_DEG = [-1.5, 1, -0.5, 1.5, -1, 0.5, 1.2, -0.8];
const HAND_RAISES_PX = [2, 0, 3, 1, 0, 2, 1, 3];
/** How far each card overlaps the one before it. */
const HAND_OVERLAP = '-3dvh';

/** How far a card floats up (px) and sways (degrees): the held reading cards more than the word cards. */
const FLOAT = { word: { px: 4, deg: 0.6 }, reading: { px: 7, deg: 1.2 } } as const;
/** Floats last FLOAT_BASE_S plus up to two FLOAT_STEP_S, and start FLOAT_PHASE_S apart, so no two cards move together. */
const FLOAT_BASE_S = 2.8;
const FLOAT_STEP_S = 0.45;
const FLOAT_PHASE_S = 0.7;

export function floatStyle(kind: 'word' | 'reading', index: number): Record<string, string> {
  return {
    '--float-px': `${FLOAT[kind].px}px`,
    '--float-deg': `${FLOAT[kind].deg}deg`,
    animationDuration: `${FLOAT_BASE_S + (index % 3) * FLOAT_STEP_S}s`,
    animationDelay: `${-index * FLOAT_PHASE_S}s`,
  };
}

/**
 * A reading card's place in the row: overlapping the card before it, with
 * its own small turn and raise. A bigger hand overlaps more, to fit. The
 * row can switch the overlap off with `--hand-overlap: 0` (on a phone the
 * hand is a grid of cards side by side, big enough to read and tap).
 */
export function handStyle(index: number, overlap: string = HAND_OVERLAP): Record<string, string> {
  const tilt = HAND_TILTS_DEG[index % HAND_TILTS_DEG.length] ?? 0;
  const raise = HAND_RAISES_PX[index % HAND_RAISES_PX.length] ?? 0;
  return {
    transform: `translateY(${-raise}px) rotate(${tilt}deg)`,
    marginLeft: index === 0 ? '0' : `calc(${overlap} * var(--hand-overlap, 1))`,
  };
}
