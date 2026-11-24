/**
 * A run of the grammar mode, Bunpou (D56): its rules as pure functions, so
 * they're tested on their own, as word mode's are (D12).
 *
 * Sentences come one at a time as shuffled tiles, with one box per tile.
 * The player puts tiles in boxes (placeTile, takeBack), in any box, in any
 * order; the sentence is judged as soon as every box is filled, or when
 * its time runs out. A right sentence adds to the
 * combo and scores; a wrong one or a timeout resets the combo, as in word
 * mode, and is kept for the pause list. The levels are word mode's
 * (levels.ts), and the time per sentence depends on the level and the
 * number of tiles. After a tale's last line, the tale is revealed.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import { FIRST_LEVEL, levelAfterMatch, levelAfterMiss } from '../game/levels.ts';
import { MISSED_TRAY_SIZE } from '../game/tuning.ts';
import { rankFor } from '../components/ui/combo-ranks.ts';
import type { Sentence } from './fill.ts';
import { closestFix, isRightOrder, type Fix } from './order-check.ts';
import type { Tale } from './tale.ts';

/** Seconds per tile at levels 1 to 5: word mode's set times per card (tuning.ts), rounded (D56). */
export const SECONDS_PER_TILE_BY_LEVEL = [8, 6, 4.4, 3.4, 2.4] as const;
/** Points for a right sentence, before the rank multiplier. */
export const POINTS_PER_SENTENCE = 100;
/** The score multiplier at each combo rank (combo-ranks.ts); below F, ×1. */
export const RANK_MULTIPLIERS: Readonly<Record<string, number>> = {
  F: 1,
  E: 1.25,
  D: 1.5,
  C: 2,
  B: 2.5,
  A: 3,
  S: 4,
  SS: 5,
  SSS: 6,
};

/** building: placing tiles; judged: the result shows; revealed: the whole tale shows. */
export type BunpouPhase = 'building' | 'judged' | 'revealed';

export interface LineResult {
  sentence: Sentence;
  /** The boxes as the player left them; a timeout can leave some empty (null). */
  answer: (string | null)[];
  isRight: boolean;
  isTimedOut: boolean;
  fix: Fix;
}

export interface BunpouRun {
  tale: Tale;
  lineIndex: number;
  /** This line's tiles in the order they're offered (shuffled). */
  offered: string[];
  /** One box per tile, left to right: the tile put there, or null while empty. */
  slots: (string | null)[];
  phase: BunpouPhase;
  /** This tale's judged lines, in order. */
  results: LineResult[];
  /** This run's latest misses, newest first, for the pause list. */
  missed: LineResult[];
  combo: number;
  bestCombo: number;
  level: number;
  score: number;
  /** When this line's time runs out (ms); pausing moves it on. */
  deadlineMs: number;
  pausedAtMs: number | null;
}

export function sentenceDurationMs(level: number, tileCount: number): number {
  const seconds = SECONDS_PER_TILE_BY_LEVEL[level - 1] ?? SECONDS_PER_TILE_BY_LEVEL[0];
  return Math.round(seconds * tileCount * 1000);
}

export function currentLine(run: BunpouRun): Sentence {
  const line = run.tale.lines[run.lineIndex];
  if (line === undefined) throw new Error(`The tale has no line ${run.lineIndex + 1}`);
  return line;
}

/** Points for a right sentence that took the combo to `combo`. */
export function pointsFor(combo: number): number {
  const letter = rankFor(combo).rank?.letter;
  const multiplier = letter === undefined ? 1 : (RANK_MULTIPLIERS[letter] ?? 1);
  return Math.round(POINTS_PER_SENTENCE * multiplier);
}

function offerLine(
  run: BunpouRun,
  lineIndex: number,
  nowMs: number,
  random: RandomSource,
): BunpouRun {
  const line = run.tale.lines[lineIndex];
  const tiles = line?.tiles.map((tile) => tile.text) ?? [];
  return {
    ...run,
    lineIndex,
    offered: shuffled(tiles, random),
    slots: tiles.map(() => null),
    phase: 'building',
    deadlineMs: nowMs + sentenceDurationMs(run.level, tiles.length),
  };
}

export function startBunpouRun(tale: Tale, nowMs: number, random: RandomSource): BunpouRun {
  const empty: BunpouRun = {
    tale,
    lineIndex: 0,
    offered: [],
    slots: [],
    phase: 'building',
    results: [],
    missed: [],
    combo: 0,
    bestCombo: 0,
    level: FIRST_LEVEL,
    score: 0,
    deadlineMs: nowMs,
    pausedAtMs: null,
  };
  return offerLine(empty, 0, nowMs, random);
}

function judge(run: BunpouRun, isTimedOut: boolean): BunpouRun {
  const sentence = currentLine(run);
  const answer = run.slots;
  const isFull = answer.every((tile) => tile !== null);
  const isRight = !isTimedOut && isFull && isRightOrder(answer, sentence);
  const result = { sentence, answer, isRight, isTimedOut, fix: closestFix(answer, sentence) };
  const judged = { ...run, phase: 'judged' as const, results: [...run.results, result] };
  if (!isRight) {
    const missed = [result, ...run.missed].slice(0, MISSED_TRAY_SIZE);
    return { ...judged, combo: 0, level: levelAfterMiss(run.level), missed };
  }
  const combo = run.combo + 1;
  return {
    ...judged,
    combo,
    bestCombo: Math.max(run.bestCombo, combo),
    level: levelAfterMatch(run.level, combo),
    score: run.score + pointsFor(combo),
  };
}

const canPlace = (run: BunpouRun): boolean => run.phase === 'building' && run.pausedAtMs === null;

/** The tiles in the boxes, in box order, without the empty ones. */
export function placedTiles(run: BunpouRun): string[] {
  return run.slots.filter((tile) => tile !== null);
}

/**
 * Puts a tile in a box: with no box named, the first empty one. A tile
 * already in a box moves; a tile already in the target box swaps into
 * the moved tile's old box, or goes back to the offered tiles. Filling
 * the last box judges the line.
 */
export function placeTile(run: BunpouRun, tile: string, at?: number): BunpouRun {
  if (!canPlace(run) || !run.offered.includes(tile)) return run;
  const target = at ?? run.slots.indexOf(null);
  if (target < 0 || target >= run.slots.length || run.slots[target] === tile) return run;
  const slots = [...run.slots];
  const from = slots.indexOf(tile);
  if (from >= 0) slots[from] = slots[target] ?? null;
  slots[target] = tile;
  const next = { ...run, slots };
  return slots.includes(null) ? next : judge(next, false);
}

/** Takes a tile out of its box; with no tile named, the rightmost one placed. */
export function takeBack(run: BunpouRun, tile = placedTiles(run).at(-1)): BunpouRun {
  if (!canPlace(run) || tile === undefined) return run;
  return { ...run, slots: run.slots.map((placed) => (placed === tile ? null : placed)) };
}

/** Judges the line as a miss once its time has run out. */
export function checkTime(run: BunpouRun, nowMs: number): BunpouRun {
  return canPlace(run) && nowMs >= run.deadlineMs ? judge(run, true) : run;
}

/** After a judged line: the next line, or the tale's reveal after its last. */
export function nextLine(run: BunpouRun, nowMs: number, random: RandomSource): BunpouRun {
  if (run.phase !== 'judged') return run;
  const nextIndex = run.lineIndex + 1;
  if (nextIndex >= run.tale.lines.length) return { ...run, phase: 'revealed' };
  return offerLine(run, nextIndex, nowMs, random);
}

/** After the reveal: the next tale's first line. */
export function nextTale(
  run: BunpouRun,
  tale: Tale,
  nowMs: number,
  random: RandomSource,
): BunpouRun {
  if (run.phase !== 'revealed') return run;
  return offerLine({ ...run, tale, results: [] }, 0, nowMs, random);
}

/** Pausing stops the line's clock; resuming moves its deadline on by the time paused. */
export function pause(run: BunpouRun, nowMs: number): BunpouRun {
  return run.pausedAtMs === null ? { ...run, pausedAtMs: nowMs } : run;
}

export function resume(run: BunpouRun, nowMs: number): BunpouRun {
  if (run.pausedAtMs === null) return run;
  return { ...run, pausedAtMs: null, deadlineMs: run.deadlineMs + (nowMs - run.pausedAtMs) };
}
