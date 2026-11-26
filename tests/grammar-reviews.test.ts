// Grammar reviews: each point scheduled like a word, today's grammar, and the points a tale is built from.
import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/game/random.ts';
import { createGrammarReviews, NEW_POINTS_PER_DAY } from '../src/grammar/grammar-reviews.ts';
import {
  makeTale,
  makeTaleFromRanking,
  MIN_TALE_POINTS,
  NoTaleFitsError,
} from '../src/grammar/tale.ts';
import { CURRICULUM, TEMPLATES } from '../src/grammar/templates.ts';
import { sentence } from './helpers/grammar-events.ts';

const DAY_1 = '2026-11-24';
const DAY_2 = '2026-11-25';
const POINTS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];

describe('grammar reviews', () => {
  it('knows a point after right sentences on two separate days, like a word', () => {
    const reviews = createGrammarReviews(POINTS, [
      sentence('p1', DAY_1, 'right'),
      sentence('p1', DAY_2, 'right'),
    ]);
    expect(reviews.progress(DAY_2)).toMatchObject({ pointsSeen: 1, pointsKnown: 1 });
  });

  it('sends a point back to the first box on a wrong order', () => {
    const reviews = createGrammarReviews(POINTS, [
      sentence('p1', DAY_1, 'right'),
      sentence('p1', DAY_2, 'right'),
      sentence('p1', DAY_2, 'wrong'),
    ]);
    expect(reviews.boxOf('p1')).toBe(1);
  });

  it('doesn’t count a timeout as an answer', () => {
    const reviews = createGrammarReviews(POINTS, [sentence('p1', DAY_1, 'timeout')]);
    expect(reviews.boxOf('p1')).toBeNull();
    expect(reviews.progress(DAY_1).pointsSeen).toBe(0);
  });

  it('ranks a new player’s points in curriculum order', () => {
    expect(createGrammarReviews(POINTS, []).pointsByPriority(DAY_1)).toEqual(POINTS);
  });

  it('builds a first day’s tales from the first points in the curriculum', () => {
    const ranked = createGrammarReviews(CURRICULUM, []).pointsByPriority(DAY_1);
    const starter = ranked.slice(0, MIN_TALE_POINTS);
    const random = seededRandom(3);
    for (let tale = 0; tale < 20; tale++) {
      const lines = makeTaleFromRanking(ranked, TEMPLATES, random).lines;
      expect(lines.every((line) => starter.includes(line.point))).toBe(true);
    }
  });

  it('takes more points when the top ones can’t fill every part of a tale', () => {
    // No template on these six points fits the twist (転), so the next point joins.
    const ranked = ['wa', 'o', 'ni-time', 'de-place', 'made', 'to-with', 'mo', 'ga-subject'];
    const lines = makeTaleFromRanking(ranked, TEMPLATES, seededRandom(1)).lines;
    expect(lines.some((line) => line.point === 'mo')).toBe(true);
    expect(lines.every((line) => line.point !== 'ga-subject')).toBe(true);
  });

  it('says when no tale fits with its own error, the only one a retry with more points catches', () => {
    expect(() => makeTale(['wa'], TEMPLATES, seededRandom(1))).toThrow(NoTaleFitsError);
  });

  it('puts points due today first, then today’s new points', () => {
    const reviews = createGrammarReviews(POINTS, [
      sentence('p4', DAY_1, 'right'),
      sentence('p5', DAY_1, 'wrong'),
    ]);
    const picked = reviews.pointsByPriority(DAY_2);
    expect(picked.slice(0, 2)).toEqual(['p4', 'p5']);
    expect(picked.slice(2, 2 + NEW_POINTS_PER_DAY)).toEqual(['p1', 'p2', 'p3']);
  });

  it('counts today’s due reviews and new points toward today’s progress', () => {
    const before = createGrammarReviews(POINTS, [sentence('p1', DAY_1, 'right')]);
    expect(before.progress(DAY_2).daily).toEqual({
      done: 0,
      total: 1 + NEW_POINTS_PER_DAY,
      isCleared: false,
    });
    before.record(sentence('p1', DAY_2, 'right'));
    expect(before.progress(DAY_2).daily.done).toBe(1);
  });

  it('caps new points a day, even when more are played to fill a tale', () => {
    const events = POINTS.slice(0, 5).map((point) => sentence(point, DAY_1, 'right'));
    const daily = createGrammarReviews(POINTS, events).progress(DAY_1).daily;
    expect(daily).toEqual({ done: NEW_POINTS_PER_DAY, total: NEW_POINTS_PER_DAY, isCleared: true });
  });
});
