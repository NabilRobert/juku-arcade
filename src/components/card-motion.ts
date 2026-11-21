/**
 * How a card moves (PlayCard passes these to Motion). A matched pair plays
 * one throw: the reading card spins through the air to its word card, hits
 * it, and both fall over. Whether the player dragged and flung the card or
 * tapped the pair, the flight starts from wherever the card is. Selecting
 * lifts a card off the table, a word card a dragged card is over rises to
 * meet it, and a new set deals in one card after another. Motion skips the movement and keeps
 * the fades when the system asks for reduced motion (App.vue).
 */
import type { CardStatus } from '../game/card-status.ts';
import type { Offset } from './throw-geometry.ts';

/** How long the thrown card flies before it hits, and how long both then take to fall. */
export const THROW_S = 0.36;
export const FALL_S = 0.34;
/** Whole turns the thrown card spins in flight, so it lands square on the word card. */
const THROW_TURNS = 2;
/** How far the knocked-down cards drop, in pixels. */
const FALL_PX = 40;
/** Depth for tipping the word card back; smaller looks more dramatic. */
const KNOCK_PERSPECTIVE_PX = 500;
/** Seconds between one card dealing in and the next. */
const DEAL_STAGGER_S = 0.05;

/** The share of the whole animation at which the thrown card hits. */
const HIT_AT = THROW_S / (THROW_S + FALL_S);
/** Keyframe times: start, the hit, a short bump on impact, lying flat. */
const KNOCK_TIMES = [0, HIT_AT, HIT_AT + 0.12, 1];

// Every pose names every value: Motion sends a value a pose leaves out back
// to its DEAL_FROM start, which would slide a falling card sideways.
type Keyframes = (number | null)[];
export type Pose = Record<string, number | Keyframes>;
export type Transition = Record<string, unknown>;

/** Where a card starts before it's dealt: above the table, turned, out of sight. */
export const DEAL_FROM: Pose = { opacity: 0, x: -24, y: -70, rotate: -14, scale: 0.9 };

const RESTING: Pose = { opacity: 1, x: 0, y: 0, rotate: 0, rotateX: 0, scale: 1 };
const LIFTED: Pose = { ...RESTING, y: -10, rotate: -2, scale: 1.06 };
/** A matched card with nowhere measured to fly (only in tests): it floats away. */
const FLOWN_OFF: Pose = { ...RESTING, opacity: 0, y: -28, scale: 0.8 };

/** The reading card's flight: `null` starts from wherever the card is now. */
function thrown(target: Offset): Pose {
  const spin = THROW_TURNS * 360;
  return {
    x: [null, target.x, target.x, target.x],
    y: [null, target.y, target.y - 4, target.y + FALL_PX],
    rotate: [null, spin, spin, spin + 10],
    scale: [null, 0.92, 0.92, 0.8],
    opacity: [null, 1, 1, 0],
    rotateX: 0,
  };
}

/** The word card stands until the hit, jolts, then tips back and falls. */
function knockedDown(index: number): Pose {
  const tilt = index % 2 === 0 ? -12 : 12;
  return {
    x: 0,
    y: [null, 0, -6, FALL_PX],
    rotate: [null, 0, 0, tilt],
    rotateX: [null, 0, 0, 70],
    transformPerspective: KNOCK_PERSPECTIVE_PX,
    scale: [null, 1, 1.08, 0.85],
    opacity: [null, 1, 1, 0],
  };
}

export interface CardMotionInput {
  status: CardStatus;
  kind: 'word' | 'reading';
  index: number;
  /** For a matched reading card: how far away its word card's slot is. */
  throwTo?: Offset;
  /** For a word card: a dragged reading card is over it. */
  isTargeted?: boolean;
}

export function cardPose({ status, kind, index, throwTo, isTargeted }: CardMotionInput): Pose {
  if (status === 'selected' || (isTargeted === true && status === 'idle')) return LIFTED;
  if (status !== 'matched') return RESTING;
  if (kind === 'word') return knockedDown(index);
  return throwTo === undefined ? FLOWN_OFF : thrown(throwTo);
}

/** Only the first deal is staggered; after that a card answers a tap at once. */
export function cardTransition(status: CardStatus, index: number, isDealt: boolean): Transition {
  if (status === 'matched') {
    return {
      duration: THROW_S + FALL_S,
      times: KNOCK_TIMES,
      ease: ['easeIn', 'easeOut', 'easeIn'],
    };
  }
  const delay = isDealt ? 0 : index * DEAL_STAGGER_S;
  return { type: 'spring', stiffness: 380, damping: 26, delay };
}
