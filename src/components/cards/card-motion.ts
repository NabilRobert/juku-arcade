/**
 * How a card moves (PlayCard passes these to Motion). A matched pair plays
 * one throw: the reading card spins through the air to its word card and
 * hits it, the word card jolts, and both then vanish block by block in a
 * front sweeping from the top-left corner (the pixel snap, pixel-snap.ts). Whether the player dragged and flung the card or
 * laid it and played the hand, the flight starts from wherever the card
 * is. A laid card shifts up out of the hand, a word card a dragged card
 * is over rises to meet it, and a new set comes off the deck face down,
 * one card after another, turning face up as it flies. Pausing turns
 * every card over in a quick wave. Motion skips the movement when the
 * system asks for reduced motion (App.vue), and a matched card then
 * vanishes at once.
 */
import type { CardStatus } from '../../game/card-status.ts';
import type { Offset, Placement } from './throw-geometry.ts';

/** How long the thrown card flies before it hits, and how long the hit's jolt then takes to settle. */
export const THROW_S = 0.36;
export const FALL_S = 0.34;
/** Whole turns the thrown card spins in flight, so it lands square on the word card. */
const THROW_TURNS = 2;
/** Depth for 3D turns (the flip); smaller looks more dramatic. */
const KNOCK_PERSPECTIVE_PX = 500;
/**
 * Milliseconds between one card coming off the deck and the next: slow
 * enough to see each one dealt, left to right, the top row first (D52).
 */
const DEAL_STAGGER_MS = 150;
/** A card coming off the deck starts turned a little, as a dealt card is. */
const DEAL_TURN_DEG = -8;

/** The share of the whole animation at which the thrown card hits. */
const HIT_AT = THROW_S / (THROW_S + FALL_S);
/** Keyframe times: start, the hit, a short bump on impact, settled. */
const KNOCK_TIMES = [0, HIT_AT, HIT_AT + 0.12, 1];

// Every pose names every value: Motion sends a value a pose leaves out back
// to where it was dealt from, which would slide a falling card sideways.
type Keyframes = (number | null)[];
export type Pose = Record<string, number | Keyframes>;
export type Transition = Record<string, unknown>;

/** With no deck measured (only in tests): a card fades in from above its place. */
/** The 3D values every pose names; the depth only shows while a card turns over. */
const FLAT: Pose = { rotateX: 0, rotateY: 0, transformPerspective: KNOCK_PERSPECTIVE_PX };
/** A card turned over: its back faces the player (PlayCard draws both sides). */
const FACE_DOWN_DEG = 180;
/** Seconds between one card flipping over and the next, when the game pauses. */
const FLIP_STAGGER_S = 0.03;

const DEAL_FROM_ABOVE: Pose = { ...FLAT, opacity: 0, x: -24, y: -70, rotate: -14, scale: 0.9 };

const RESTING: Pose = { ...FLAT, opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 };
const LIFTED: Pose = { ...RESTING, y: -10, rotate: -2, scale: 1.06 };
/** A laid card shifts up out of the hand, so the player sees it's been played. */
const LAID: Pose = { ...RESTING, y: -22 };
/** A matched card with nowhere measured to fly (only in tests): it floats away. */
const FLOWN_OFF: Pose = { ...RESTING, opacity: 0, y: -28, scale: 0.8 };

/** Where a card starts before it's dealt: face down on top of the deck, the deck's size. */
export function dealtFrom(deck: Placement | undefined): Pose {
  if (deck === undefined) return DEAL_FROM_ABOVE;
  const { x, y, scale } = deck;
  return { ...FLAT, rotateY: FACE_DOWN_DEG, opacity: 1, x, y, rotate: DEAL_TURN_DEG, scale };
}

/** The reading card's flight: `null` starts from wherever the card is now. */
function thrown(target: Offset): Pose {
  const spin = THROW_TURNS * 360;
  return {
    x: [null, target.x, target.x, target.x],
    y: [null, target.y, target.y - 4, target.y],
    rotate: [null, spin, spin, spin],
    scale: [null, 0.92, 0.97, 0.92],
    opacity: 1,
    ...FLAT,
  };
}

/** The word card stands until the hit, then jolts and settles where it is. */
const JOLTED: Pose = {
  ...FLAT,
  x: 0,
  y: [null, 0, -6, 0],
  rotate: 0,
  scale: [null, 1, 1.08, 1],
  opacity: 1,
};

export interface CardMotionInput {
  status: CardStatus;
  kind: 'word' | 'reading';
  index: number;
  /** For a matched reading card: how far away its word card's slot is. */
  throwTo?: Offset;
  /** For a word card: a dragged reading card is over it. */
  isTargeted?: boolean;
  /** For a reading card: laid out, waiting for Play. */
  isLaid?: boolean;
}

/** A card still on the table: face down while paused, else lifted, laid or resting. */
function tablePose({ status, isTargeted, isLaid }: CardMotionInput): Pose {
  const base = isLaid === true ? LAID : RESTING;
  if (status === 'hidden') return { ...base, rotateY: FACE_DOWN_DEG };
  if (status === 'selected' || (isTargeted === true && status === 'idle')) return LIFTED;
  return base;
}

export function cardPose(input: CardMotionInput): Pose {
  const { status, kind, throwTo } = input;
  if (status !== 'matched') return tablePose(input);
  if (kind === 'word') return JOLTED;
  return throwTo === undefined ? FLOWN_OFF : thrown(throwTo);
}

/** A flip turns a little slower and softer than other moves, so it reads as a turn. */
const FLIP_SPRING: Transition = { type: 'spring', stiffness: 260, damping: 22 };

/** The deal and the pause flip are staggered; otherwise a card answers a click at once. */
/** When a card leaves the deck, in milliseconds after the deal starts: its place on the board decides. */
export function dealDelayMs(index: number): number {
  return index * DEAL_STAGGER_MS;
}

/**
 * A Bunpou tile's deal (D58), the cards' own: it comes in from above its
 * place on the cards' stagger and spring, with no deck to come off.
 */
export const TILE_DEALT_FROM: Pose = DEAL_FROM_ABOVE;
export const TILE_RESTING: Pose = RESTING;
export function tileDealTransition(index: number): Transition {
  return { type: 'spring', stiffness: 380, damping: 26, delay: dealDelayMs(index) / 1000 };
}

export function cardTransition(status: CardStatus, index: number, isDealt: boolean): Transition {
  if (status === 'matched') {
    return {
      duration: THROW_S + FALL_S,
      times: KNOCK_TIMES,
      ease: ['easeIn', 'easeOut', 'easeIn'],
    };
  }
  if (status === 'hidden') return { ...FLIP_SPRING, delay: index * FLIP_STAGGER_S };
  const delay = isDealt ? 0 : dealDelayMs(index) / 1000;
  // Turning over keeps its softer spring, whichever way the card turns.
  return { type: 'spring', stiffness: 380, damping: 26, delay, rotateY: { ...FLIP_SPRING, delay } };
}
