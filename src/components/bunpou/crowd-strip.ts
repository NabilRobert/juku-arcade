/**
 * The Bunpou audience as one packed strip of silhouettes (D58), seen from
 * behind like a concert crowd gathered round the storyteller: heads of
 * different shapes at different heights, rising towards the sides and
 * dipping in the middle so the crowd wraps round the stage, overlapping
 * so their bodies merge into one dark mass, with a
 * few arms thrown up when the crowd cheers and, when a tale falls flat,
 * one phone screen glowing in the dark.
 *
 * The strip is built from a handful of head shapes with a seeded random
 * generator, so it's the same every time, and drawn as one sprite about
 * the stage's shape that covers its full width.
 */
import { seededRandom } from '../../game/random.ts';

/** The strip's size in pixels: about the stage's own shape, so its curved ends stay in view. */
export const CROWD_WIDTH = 150;
export const CROWD_HEIGHT = 28;
const BODY = 'z';

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
/** A phone held up: the hand, then the glowing screen above it. */
const PHONE_UP: readonly string[] = ['pp', 'pp', 'pp', 'zz', 'zz', 'zz', 'zz'];

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

/** The rows' colours: the back row a shade lighter, so the two read as depth. */
export const CROWD_PALETTES = {
  back: { z: '#0e1526', p: '#a8dadc' },
  front: { z: '#05080f', p: '#a8dadc' },
} as const;

/** How far the middle of the crowd sits below its sides, in pixels: the arc round the stage. */
const ARC_DEPTH = 11;

/** How far below its row's top a head at `x` sits: none at the sides, ARC_DEPTH in the middle. */
function arcDrop(x: number): number {
  const fromMiddle = (2 * x) / CROWD_WIDTH - 1;
  return Math.round(ARC_DEPTH * (1 - fromMiddle * fromMiddle));
}

/** How many of the crowd throw an arm up when it cheers. */
const ARM_SHARE = 0.4;
/** The member holding the phone sits this far along the strip. */
const PHONE_PLACE = 0.62;

function seatMembers(seed: number, lowestTop: number, highestTop: number): Member[] {
  const random = seededRandom(seed);
  const members: Member[] = [];
  for (let x = -4; x < CROWD_WIDTH;) {
    const head = HEADS[Math.floor(random() * HEADS.length)] ?? HEADS[0] ?? [];
    const wanted = highestTop + Math.floor(random() * (lowestTop - highestTop + 1)) + arcDrop(x);
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
      if (
        letter !== '.' &&
        cells !== undefined &&
        left + column >= 0 &&
        left + column < CROWD_WIDTH
      ) {
        cells[left + column] = letter;
      }
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

/** The crowd is one solid mass: below the first silhouette pixel in each column, everything is dark. */
function fillGaps(canvas: string[][]): void {
  for (let column = 0; column < CROWD_WIDTH; column++) {
    let isInside = false;
    for (const cells of canvas) {
      if (cells[column] === BODY) isInside = true;
      else if (isInside) cells[column] = BODY;
    }
  }
}

/** Where heads sit in each of the two rows (top rows, from the strip's top), leaving room for raised arms. */
export const CROWD_ROWS = {
  back: { seed: 11, highestTop: 3, lowestTop: 7 },
  front: { seed: 23, highestTop: 9, lowestTop: 13 },
} as const;

/** The strip as a letter grid: z is a silhouette, p the phone screen, '.' see-through. */
export function crowdStrip(row: keyof typeof CROWD_ROWS, look: CrowdLook): string[] {
  const { seed, highestTop, lowestTop } = CROWD_ROWS[row];
  const canvas = Array.from({ length: CROWD_HEIGHT }, () => Array<string>(CROWD_WIDTH).fill('.'));
  const members = seatMembers(seed, lowestTop, highestTop);
  for (const member of members) {
    stamp(canvas, member.head, member.x, member.y);
    fillBody(canvas, member);
    if (look.isCheering && member.arm !== 0) raiseArm(canvas, member);
  }
  fillGaps(canvas);
  if (look.hasPhone) {
    const holder = members[Math.floor(members.length * PHONE_PLACE)];
    if (holder !== undefined) stamp(canvas, PHONE_UP, holder.x + 7, holder.y - 5);
  }
  return canvas.map((cells) => cells.join(''));
}
