// Given particles (D77): some Bunpou lines start with their particles fixed in their boxes.
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BunpouBoard from '../src/components/bunpou/BunpouBoard.vue';
import { seededRandom } from '../src/game/random.ts';
import * as rules from '../src/grammar/bunpou-run.ts';
import type { Sentence } from '../src/grammar/fill.ts';
import { chooseGivenBoxes, particlePositions } from '../src/grammar/given-particles.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { CURRICULUM, TEMPLATES } from '../src/grammar/templates.ts';

const START_MS = 0;
/** Enough seeds that every help (all, all but one, none) turns up. */
const SEEDS_TO_TRY = 200;

function sentenceOf(units: string[][]): Sentence {
  return {
    templateId: 'test',
    point: 'wa',
    shelf: 'S',
    tiles: units.flat().map((text) => ({ text, marked: text })),
    units,
    fixedUnits: [],
    swaps: [],
  };
}

const TWO_PARTICLES = sentenceOf([['先生', 'は'], ['卵', 'を'], ['毎朝食べます']]);

function gameRun(seed: number): rules.BunpouRun {
  const random = seededRandom(seed);
  return rules.startBunpouRun(makeTale(CURRICULUM, TEMPLATES, random), START_MS, random, true);
}

/** The first game run, by seed, whose first line starts with exactly `given` particles. */
function runWithGiven(given: number): rules.BunpouRun {
  for (let seed = 1; seed <= SEEDS_TO_TRY; seed++) {
    const run = gameRun(seed);
    if (run.givenBoxes.length === given) return run;
  }
  throw new Error(`no seed gave a first line with ${given} particles given`);
}

const rightOrder = (run: rules.BunpouRun): string[] =>
  rules.currentLine(run).tiles.map((tile) => tile.text);

describe('which particles a line gives', () => {
  it('finds the particle tiles, not the pattern pieces with a comma', () => {
    expect(particlePositions(TWO_PARTICLES)).toEqual([1, 3]);
    const pattern = sentenceOf([['ご飯を食べて', 'から、'], ['先生は'], ['寝ました']]);
    expect(particlePositions(pattern)).toEqual([]);
  });

  it('gives all the particles, all but one, or none, and nothing else', () => {
    const counts = new Set<number>();
    for (let seed = 1; seed <= SEEDS_TO_TRY; seed++) {
      const given = chooseGivenBoxes(TWO_PARTICLES, seededRandom(seed));
      counts.add(given.length);
      for (const box of given) expect([1, 3]).toContain(box);
    }
    expect([...counts].sort()).toEqual([0, 1, 2]);
  });
});

describe('a line with particles given', () => {
  it('starts with them in their boxes and offers only the other tiles', () => {
    const run = runWithGiven(2);
    const line = rightOrder(run);
    for (const box of run.givenBoxes) {
      expect(run.boxes[box]).toBe(line[box]);
      expect(run.offered).not.toContain(line[box]);
    }
    expect(run.offered).toHaveLength(line.length - 2);
  });

  it('gives time only for the tiles left to place', () => {
    const run = runWithGiven(2);
    expect(run.lineDurationMs).toBe(rules.sentenceDurationMs(run.level, run.offered.length));
  });

  it('keeps a given box closed to other tiles', () => {
    const run = runWithGiven(1);
    const [givenBox = -1] = run.givenBoxes;
    const [loose = ''] = run.offered;
    expect(rules.placeTile(run, loose, givenBox)).toBe(run);
  });

  it('never takes a given particle back, by name or with Backspace', () => {
    const run = runWithGiven(1);
    const [givenBox = -1] = run.givenBoxes;
    expect(rules.takeBack(run, run.boxes[givenBox] ?? '')).toBe(run);
    expect(rules.takeBack(run)).toBe(run);
    expect(rules.placedTiles(run)).toEqual([]);
  });

  it('is right once the loose tiles fill the other boxes in order', () => {
    const run = runWithGiven(1);
    const loose = rightOrder(run).filter((_, index) => !run.givenBoxes.includes(index));
    const judged = loose.reduce((built, tile) => rules.placeTile(built, tile), run);
    expect(judged.phase).toBe('judged');
    expect(judged.results[0]?.isRight).toBe(true);
    expect(judged.results[0]?.givenBoxes).toEqual(run.givenBoxes);
  });

  it('never happens in the dojo’s check, which gives no particles', () => {
    for (let seed = 1; seed <= SEEDS_TO_TRY; seed++) {
      const random = seededRandom(seed);
      const run = rules.startBunpouRun(makeTale(CURRICULUM, TEMPLATES, random), START_MS, random);
      expect(run.givenBoxes).toEqual([]);
    }
  });

  it('shows a given particle fixed in its box on the board', () => {
    const run = runWithGiven(1);
    const unplaced = run.offered;
    const board = mount(BunpouBoard, { props: { run, unplaced, timeLeft: 1 } });
    const given = board.findAll('[data-given]');
    expect(given).toHaveLength(1);
    expect(given[0]?.attributes('disabled')).toBeDefined();
    expect(board.find('[data-testid="offered"]').findAll('button')).toHaveLength(unplaced.length);
  });
});
