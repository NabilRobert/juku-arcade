// A Bunpou run: placing tiles, judging a line, combo, level and score, time, pause, next line and tale.
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/game/random.ts';
import {
  checkTime,
  currentLine,
  nextLine,
  nextTale,
  pause,
  placeTile,
  pointsFor,
  POINTS_PER_SENTENCE,
  resume,
  sentenceDurationMs,
  startBunpouRun,
  takeBack,
  type BunpouRun,
} from '../src/grammar/bunpou-run.ts';
import { makeTale } from '../src/grammar/tale.ts';
import { POINT_PATTERNS, TEMPLATES } from '../src/grammar/templates.ts';

const POINTS = Object.keys(POINT_PATTERNS);
const random = seededRandom(5);
const START_MS = 1000;

const newRun = (): BunpouRun =>
  startBunpouRun(makeTale(POINTS, TEMPLATES, random), START_MS, random);
const rightOrder = (run: BunpouRun): string[] => currentLine(run).tiles.map((tile) => tile.text);

function placeAll(run: BunpouRun, tiles: readonly string[]): BunpouRun {
  return tiles.reduce((built, tile) => placeTile(built, tile), run);
}

/** The right tiles with the first two swapped: always wrong, since a particle can't open a sentence. */
function wrongOrder(run: BunpouRun): string[] {
  const [first = '', second = '', ...rest] = rightOrder(run);
  return [second, first, ...rest];
}

describe('a Bunpou run', () => {
  it('offers the line’s tiles shuffled, with a time set by the level and the tile count', () => {
    const run = newRun();
    expect([...run.offered].sort()).toEqual([...rightOrder(run)].sort());
    expect(run.deadlineMs - START_MS).toBe(sentenceDurationMs(1, run.offered.length));
  });

  it('judges a line once its last tile is placed, and scores a right one', () => {
    const run = newRun();
    const judged = placeAll(run, rightOrder(run));
    expect(judged.phase).toBe('judged');
    expect(judged.results[0]?.isRight).toBe(true);
    expect(judged).toMatchObject({ combo: 1, score: POINTS_PER_SENTENCE });
  });

  it('resets the combo on a wrong line, keeps it for the pause list and marks the wrong tiles', () => {
    const run = { ...newRun(), combo: 7, level: 2 };
    const judged = placeAll(run, wrongOrder(run));
    expect(judged).toMatchObject({ combo: 0, level: 1, score: 0 });
    expect(judged.missed[0]?.answer).toEqual(wrongOrder(run));
    expect(judged.missed[0]?.fix.wrongAt).toEqual([0, 1]);
  });

  it('puts a tapped tile in the first empty box', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    expect(placeAll(run, [first, second]).slots.slice(0, 3)).toEqual([first, second, null]);
  });

  it('takes a placed tile back, leaving its box empty, or the rightmost one', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    const two = placeAll(run, [first, second]);
    expect(takeBack(two, first).slots.slice(0, 2)).toEqual([null, second]);
    expect(takeBack(two).slots.slice(0, 2)).toEqual([first, null]);
  });

  it('puts a dragged tile in the box it was dropped on, even past empty ones', () => {
    const run = newRun();
    const last = rightOrder(run).at(-1) ?? '';
    const lastBox = run.slots.length - 1;
    const placed = placeTile(run, last, lastBox);
    expect(placed.slots[lastBox]).toBe(last);
    expect(placed.slots.slice(0, lastBox).every((tile) => tile === null)).toBe(true);
  });

  it('moves a placed tile to another box, swapping with a tile already there', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    const two = placeAll(run, [first, second]);
    expect(placeTile(two, first, 1).slots.slice(0, 2)).toEqual([second, first]);
    expect(placeTile(two, first, 2).slots.slice(0, 3)).toEqual([null, second, first]);
  });

  it('sends a tile in the target box back to the offered tiles when a new tile replaces it', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    const replaced = placeTile(placeTile(run, first, 0), second, 0);
    expect(replaced.slots[0]).toBe(second);
    expect(replaced.slots).not.toContain(first);
  });

  it('counts a line whose time runs out as a miss, with what was placed', () => {
    const fresh = { ...newRun(), combo: 3 };
    const run = placeTile(fresh, rightOrder(fresh)[0] ?? '');
    expect(checkTime(run, run.deadlineMs - 1)).toBe(run);
    const timedOut = checkTime(run, run.deadlineMs);
    expect(timedOut.results[0]).toMatchObject({
      isTimedOut: true,
      isRight: false,
      answer: run.slots,
    });
    expect(timedOut.combo).toBe(0);
  });

  it('freezes the clock and the tiles while paused', () => {
    const paused = pause(newRun(), START_MS + 500);
    expect(placeTile(paused, paused.offered[0] ?? '')).toBe(paused);
    expect(checkTime(paused, paused.deadlineMs + 10_000)).toBe(paused);
    const resumed = resume(paused, START_MS + 2500);
    expect(resumed.deadlineMs).toBe(paused.deadlineMs + 2000);
  });

  it('moves to the next line, and reveals the tale after its last', () => {
    let run = newRun();
    for (let line = 1; line < run.tale.lines.length; line++) {
      run = nextLine(placeAll(run, rightOrder(run)), START_MS, random);
      expect(run.phase).toBe('building');
      expect(run.lineIndex).toBe(line);
      expect(run.slots.every((tile) => tile === null)).toBe(true);
    }
    run = nextLine(placeAll(run, rightOrder(run)), START_MS, random);
    expect(run.phase).toBe('revealed');
    expect(run.results).toHaveLength(run.tale.lines.length);
    const next = nextTale(run, makeTale(POINTS, TEMPLATES, random), START_MS, random);
    expect(next).toMatchObject({ lineIndex: 0, phase: 'building', results: [] });
  });

  it('multiplies a right sentence’s points by the combo rank', () => {
    expect(pointsFor(1)).toBe(POINTS_PER_SENTENCE);
    expect(pointsFor(4)).toBe(POINTS_PER_SENTENCE * 1.25);
    expect(pointsFor(30)).toBe(POINTS_PER_SENTENCE * 6);
  });
});
