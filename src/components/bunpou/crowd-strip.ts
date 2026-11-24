/**
 * The Bunpou audience as packed silhouettes (D58), seen from behind like a
 * crowd gathered round the storyteller: tiers of heads of different
 * shapes, filling the stage to the top at the sides and parting in a U in
 * the middle so he sits in the gap. The tiers make three layers (far,
 * middle, near), each its own shade, so the rows read as raked seating.
 * A few arms go up when the crowd cheers, and when a tale falls flat one
 * phone screen glows in the near layer.
 *
 * Each layer is built from a handful of head shapes with a seeded random
 * generator, so it's the same every time, and drawn as one sprite the
 * stage's own shape, covering it.
 */
import { seededRandom } from '../../game/random.ts';

/** The strip's size in pixels: the stage's own shape (about 5.4 wide to 1 high). */
export const CROWD_WIDTH = 300;
export const CROWD_HEIGHT = 56;
const BODY = 'z';

/**
 * The crowd sits in tiers, like raked seating: tier 0 at the top, each
 * next one TIER_STEP lower, give or take TIER_JITTER. A layer's lift
 * raises all its heads, so the middle layer peeks higher over the near
 * one; its U is shallower too, so it shows across the middle as well.
 */
const TIER_STEP = 6;
const TIER_JITTER = 3;
export const CROWD_LAYERS = {
  far: { seed: 11, tiers: [0, 1, 2], lift: 0, uDepth: 35 },
  middle: { seed: 17, tiers: [3, 4, 5], lift: 4, uDepth: 24 },
  near: { seed: 23, tiers: [6, 7], lift: 0, uDepth: 35 },
} as const;
export type CrowdLayer = keyof typeof CROWD_LAYERS;

/** The layers' shades: the far one catches a little of the stage light, the near one is darkest. */
export const CROWD_PALETTES: Record<CrowdLayer, Readonly<Record<string, string>>> = {
  far: { z: '#2b4366', p: '#a8dadc' },
  middle: { z: '#141f36', p: '#a8dadc' },
  near: { z: '#05080f', p: '#a8dadc' },
};

/**
 * The crowd parts round the storyteller in a U: at the sides it fills the
 * stage to the top; across the middle (U_HALF_WIDTH of each half) it
 * drops away, deepest (by each layer's uDepth) right under his cushion.
 */
const U_HALF_WIDTH = 0.5;

/** Heads and shoulders; the body under each is filled down to the strip's bottom. */
const HEADS: readonly (readonly string[])[] = [
  [
    '...zzzz...',
    '..zzzzzz..',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '..zzzzzz..',
    '...zzzz...',
    '.zzzzzzzz.',
    'zzzzzzzzzz',
  ],
  [
    '..zzzz....',
    '.zzzzzz...',
    '.zzzzzzz..',
    '.zzzzzzzz.',
    '.zzzzzzz..',
    '..zzzzz...',
    '...zzzz...',
    '.zzzzzzzz.',
    'zzzzzzzzzz',
  ],
  [
    '....zzzz..',
    '...zzzzzz.',
    '..zzzzzzz.',
    '.zzzzzzzz.',
    '..zzzzzzz.',
    '...zzzzz..',
    '...zzzz...',
    '.zzzzzzzz.',
    'zzzzzzzzzz',
  ],
  [
    '...zzzz...',
    '..zzzzzz..',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    'zzzzzzzzzz',
    'zzzzzzzzzz',
  ],
  [
    '....zz....',
    '...zzzz...',
    '...zzzz...',
    '..zzzzzz..',
    '.zzzzzzzz.',
    '.zzzzzzzz.',
    '..zzzzzz..',
    '...zzzz...',
    '.zzzzzzzz.',
    'zzzzzzzzzz',
  ],
  ['..zzz..', '.zzzzz.', '.zzzzz.', '.zzzzz.', '..zzz..', '.zzzzz.', 'zzzzzzz'],
];
/** An arm thrown up and out to the right from the shoulder; mirrored for the left. */
const ARM_UP: readonly string[] = [
  '....zz',
  '....zz',
  '...zz.',
  '...zz.',
  '...zz.',
  '..zz..',
  '..zz..',
  '..zz..',
  '.zz...',
  '.zz...',
  'zz....',
  'zz....',
];
/** A phone held up: the glowing screen, then the hand under it. */
const PHONE_UP: readonly string[] = ['pp', 'pp', 'pp', 'zz', 'zz', 'zz', 'zz'];
/** How many of the crowd throw an arm up when it cheers. */
const ARM_SHARE = 0.4;
/** The phone is held up this far along the strip, right of the storyteller. */
const PHONE_PLACE = 0.85;

/** One audience member's place in the strip, fixed by the seed. */
interface Member {
  head: readonly string[];
  x: number;
  y: number;
  /** Throws an arm up when the crowd cheers: -1 the left arm, 1 the right, 0 neither. */
  arm: -1 | 0 | 1;
}

export interface CrowdLook {
  isCheering: boolean;
  hasPhone: boolean;
}

/** How far below its tier a head at `x` sits: none at the sides, `depth` in the middle. */
function uDrop(x: number, depth: number): number {
  const fromMiddle = ((2 * x) / CROWD_WIDTH - 1) / U_HALF_WIDTH;
  return Math.max(0, Math.round(depth * (1 - fromMiddle * fromMiddle)));
}

interface TierPlace {
  tier: number;
  lift: number;
  uDepth: number;
}

function seatTier(random: () => number, place: TierPlace): Member[] {
  const { tier, lift, uDepth } = place;
  const members: Member[] = [];
  for (let x = -4; x < CROWD_WIDTH;) {
    const head = HEADS[Math.floor(random() * HEADS.length)] ?? HEADS[0] ?? [];
    const wanted =
      1 + tier * TIER_STEP - lift + Math.floor(random() * TIER_JITTER) + uDrop(x, uDepth);
    // Shoulders always inside the strip: a head pushed lower would leave a gap in the crowd.
    const y = Math.min(wanted, CROWD_HEIGHT - head.length);
    const raisesArm = random() < ARM_SHARE;
    const arm = raisesArm ? (random() < 0.5 ? -1 : 1) : 0;
    members.push({ head, x, y, arm });
    x += (head[0]?.length ?? 8) - 2 - Math.floor(random() * 3);
  }
  return members;
}

function stamp(canvas: string[][], grid: readonly string[], left: number, top: number): void {
  grid.forEach((line, row) => {
    [...line].forEach((letter, column) => {
      const cells = canvas[top + row];
      const x = left + column;
      if (letter !== '.' && cells !== undefined && x >= 0 && x < CROWD_WIDTH) cells[x] = letter;
    });
  });
}

/** Fills the body down to the bottom under a head's shoulders. */
function fillBody(canvas: string[][], member: Member): void {
  const shoulders = member.head.at(-1) ?? '';
  for (let row = member.y + member.head.length; row < CROWD_HEIGHT; row++) {
    stamp(canvas, [shoulders], member.x, row);
  }
}

function raiseArm(canvas: string[][], member: Member): void {
  const width = member.head[0]?.length ?? 8;
  const arm = member.arm === 1 ? ARM_UP : ARM_UP.map((line) => [...line].reverse().join(''));
  const left = member.arm === 1 ? member.x + width - 3 : member.x - 3;
  stamp(canvas, arm, left, member.y + member.head.length - 1 - arm.length);
}

/** Each layer is one solid mass: below the first silhouette pixel in each column, everything is dark. */
function fillGaps(canvas: string[][]): void {
  for (let column = 0; column < CROWD_WIDTH; column++) {
    let isInside = false;
    for (const cells of canvas) {
      if (cells[column] === BODY) isInside = true;
      else if (isInside) cells[column] = BODY;
    }
  }
}

/** The member nearest PHONE_PLACE along the strip, among the last seated (the frontmost tier). */
function phoneHolder(members: readonly Member[]): Member | undefined {
  const target = CROWD_WIDTH * PHONE_PLACE;
  let best: Member | undefined;
  for (const member of members.slice(-Math.ceil(CROWD_WIDTH / 8))) {
    if (best === undefined || Math.abs(member.x - target) < Math.abs(best.x - target))
      best = member;
  }
  return best;
}

/** A layer as a letter grid: z is a silhouette, p the phone screen, '.' see-through. */
export function crowdStrip(layer: CrowdLayer, look: CrowdLook): string[] {
  const { seed, tiers, lift, uDepth } = CROWD_LAYERS[layer];
  const random = seededRandom(seed);
  const members = tiers.flatMap((tier) => seatTier(random, { tier, lift, uDepth }));
  const canvas = Array.from({ length: CROWD_HEIGHT }, () => Array<string>(CROWD_WIDTH).fill('.'));
  for (const member of members) {
    stamp(canvas, member.head, member.x, member.y);
    fillBody(canvas, member);
    if (look.isCheering && member.arm !== 0) raiseArm(canvas, member);
  }
  fillGaps(canvas);
  const holder = look.hasPhone ? phoneHolder(members) : undefined;
  if (holder !== undefined) stamp(canvas, PHONE_UP, holder.x + 7, holder.y - 5);
  return canvas.map((cells) => cells.join(''));
}
