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

  it('takes a placed tile back, or the last one placed', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    const two = placeAll(run, [first, second]);
    expect(takeBack(two, first).placed).toEqual([second]);
    expect(takeBack(two).placed).toEqual([first]);
  });

  it('places a dragged tile where it was dropped', () => {
    const run = newRun();
    const [first = '', second = ''] = rightOrder(run);
    expect(placeTile(placeTile(run, second), first, 0).placed).toEqual([first, second]);
  });

  it('counts a line whose time runs out as a miss, with what was placed', () => {
    const fresh = { ...newRun(), combo: 3 };
    const run = placeTile(fresh, rightOrder(fresh)[0] ?? '');
    expect(checkTime(run, run.deadlineMs - 1)).toBe(run);
    const timedOut = checkTime(run, run.deadlineMs);
    expect(timedOut.results[0]).toMatchObject({
      isTimedOut: true,
      isRight: false,
      answer: run.placed,
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
      expect(run).toMatchObject({ lineIndex: line, phase: 'building', placed: [] });
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
