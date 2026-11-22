/**
 * How cards sit on the table, shared by word mode (GameBoard) and kanji
 * mode (KanjiBoard): slots the size of their card, the fan the reading
 * cards are held in, and the gentle float every card has while it waits.
 */

/** Each slot is the size of the card in it (PlayCard draws the card the same size). */
export const SLOT_SIZE = 'mx-auto aspect-[3/4] w-[min(100%,calc(var(--card-height)*0.75))]';

/** The fan the hand is held in: each card turns this much more than the one before it... */
const FAN_TURN_DEG = 4;
/** ...and the cards towards the ends drop lower, by this times the square of their distance from the middle. */
const FAN_DROP_PX = 4;
/** How far each card in the hand overlaps the one before it. */
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
 * A reading card's place in a fan of `count` cards: turned and dropped by
 * how far it is from the middle. A bigger hand overlaps more, to fit.
 */
export function fanStyle(
  index: number,
  count: number,
  overlap: string = HAND_OVERLAP,
): Record<string, string> {
  const fromMiddle = index - (count - 1) / 2;
  const turn = fromMiddle * FAN_TURN_DEG;
  const drop = fromMiddle * fromMiddle * FAN_DROP_PX;
  return {
    transform: `translateY(${drop}px) rotate(${turn}deg)`,
    marginLeft: index === 0 ? '0' : overlap,
  };
}
