import { describe, expect, it } from 'vitest';
import type { DecoyType } from '../src/deck/types.ts';
import { makeEvent } from '../src/game/events.ts';
import { seededRandom } from '../src/game/random.ts';
import {
  commonConfusions,
  errorTypeRates,
  mostMissedWords,
} from '../scripts/report/class-report.ts';
import { learnerReport } from '../scripts/report/learner-report.ts';
import { mergeExports } from '../scripts/report/load.ts';
import { measure } from '../scripts/report/measurement.ts';
import { eventsCsv, renderMeasurement } from '../scripts/report/render.ts';
import { simulateExports, type Plan } from '../scripts/report/simulate.ts';

const BASE: Plan = {
  players: 12,
  days: 14,
  recall: { before: 0.35, after: 0.6, held_back: 0.4 },
  seed: 7,
};

function measured(plan: Plan) {
  return measure(mergeExports(simulateExports(plan)).events, seededRandom(1));
}

describe('the measurement report on simulated players', () => {
  // With 12 players a real +20 effect is called "works" about 85% of the time
  // (npm run power); 30 players makes this check reliable rather than lucky.
  it('recovers a planted play effect of +20 points within its interval', () => {
    const result = measured({ ...BASE, players: 30 });
    const [low, high] = result.interval ?? [0, 0];
    expect(result.verdict).toBe('play_works');
    expect(low).toBeLessThanOrEqual(20);
    expect(high).toBeGreaterThanOrEqual(20);
  });

  it('does not claim an effect when play adds nothing', () => {
    const result = measured({ ...BASE, recall: { before: 0.4, after: 0.5, held_back: 0.5 } });
    const [low, high] = result.interval ?? [0, 0];
    expect(result.verdict).not.toBe('play_works');
    expect(low).toBeLessThanOrEqual(0);
    expect(high).toBeGreaterThanOrEqual(0);
  });

  it('says "not enough data" with fewer than 5 players, and gives no number', () => {
    const result = measured({ ...BASE, players: 4 });
    expect(result.verdict).toBe('not_enough_data');
    expect(result.playEffect).toBeNull();
    expect(renderMeasurement(result, mergeExports([]).quality)).toContain('Not enough data');
  });
});

describe('the class report on simulated players', () => {
  const events = mergeExports(
    simulateExports({
      ...BASE,
      weakWordMissChance: 0.8,
      hardType: { type: 'smallYoon', missChance: 0.5 },
    }),
  ).events;

  it('flags the planted weak word for re-teaching', () => {
    const weak = mostMissedWords(events).find((row) => row.word === '語weak');
    expect(weak).toMatchObject({ isFlagged: true });
    expect(weak?.share).toBeGreaterThan(0.7);
  });

  it('does not flag a word missed now and then, even if most learners missed it once', () => {
    const easy = mostMissedWords(events).find((row) => row.word === '語easy');
    expect(easy?.isFlagged).toBe(false);
  });

  it('flags the planted error type, measured per time shown', () => {
    const flagged = errorTypeRates(events)
      .filter((row) => row.isFlagged)
      .map((row) => row.errorType);
    expect(flagged).toEqual(['smallYoon']);
  });

  it('flags a type shown rarely but missed often, which raw miss counts would hide', () => {
    const identity = { playerId: 'p', sessionId: 's', classCode: null };
    const event = (kind: 'deal' | 'miss', type: DecoyType) =>
      makeEvent(identity, new Date(), {
        kind,
        error_type: type,
        wrong_card_role: kind === 'miss' ? 'decoy' : null,
        level: 1,
        set_index: 0,
      });
    const repeat = (count: number, kind: 'deal' | 'miss', type: DecoyType) =>
      Array.from({ length: count }, () => event(kind, type));
    const log = [
      ...repeat(10, 'deal', 'smallYoon'),
      ...repeat(5, 'miss', 'smallYoon'),
      ...repeat(100, 'deal', 'dakuten'),
      ...repeat(10, 'miss', 'dakuten'),
      ...repeat(100, 'deal', 'longVowel'),
      ...repeat(10, 'miss', 'longVowel'),
    ];
    expect(
      errorTypeRates(log)
        .filter((row) => row.isFlagged)
        .map((row) => row.errorType),
    ).toEqual(['smallYoon']);
  });

  it('keeps decoy confusions apart from mix-ups between words', () => {
    const confusions = commonConfusions(events);
    expect(confusions.some((row) => row.isDecoy)).toBe(true);
    expect(confusions.some((row) => !row.isDecoy)).toBe(true);
  });

  it('holds back words met by fewer than 5 learners', () => {
    const fewPlayers = mergeExports(
      simulateExports({ ...BASE, players: 4, weakWordMissChance: 0.9 }),
    ).events;
    expect(mostMissedWords(fewPlayers)).toEqual([]);
  });
});

describe('loading and the learner report', () => {
  it('drops duplicate events when the same export is sent twice', () => {
    const files = simulateExports({ ...BASE, players: 2 });
    const once = mergeExports(files);
    const twice = mergeExports([...files, ...files]);
    expect(twice.events).toHaveLength(once.events.length);
    expect(twice.quality.duplicatesDropped).toBe(once.events.length);
  });

  it("reports a learner's weak word and usual wrong reading", () => {
    const [file] = simulateExports({ ...BASE, players: 1, weakWordMissChance: 1 });
    const report = learnerReport(
      file?.player_id ?? '',
      file?.events ?? [],
      new Date('2026-11-15T12:00:00+07:00'),
    );
    expect(report.weakWords[0]).toMatchObject({ word: '語weak', usualPick: 'ごweakx' });
  });

  it('writes one CSV row per event, quoting cells that need it', () => {
    const [file] = simulateExports({ ...BASE, players: 1, days: 1 });
    const csv = eventsCsv(file?.events ?? []);
    expect(csv.split('\n')).toHaveLength((file?.events.length ?? 0) + 1);
    expect(csv.split('\n')[0]).toContain('check_up_role');
  });
});
