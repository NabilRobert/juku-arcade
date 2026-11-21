// The play report (S1–S6): each measure on a few hand-built events whose answer is known.
import { describe, expect, it } from 'vitest';
import { makeEvent, type GameEvent } from '../src/game/events.ts';
import { deckCompletion, difficultyPredictions } from '../scripts/report/deck-measures.ts';
import {
  checkUpUptake,
  comingBack,
  loopBalance,
  peekMeasure,
} from '../scripts/report/play-measures.ts';
import { renderPlayReport, type PlayMeasures } from '../scripts/report/render-play.ts';
import { deckWord } from './helpers/fixtures.ts';

interface EventSpec extends Partial<GameEvent> {
  kind: GameEvent['kind'];
  /** Day of November 2026. */
  day: number;
  player?: string;
  session?: string;
}

let minute = 0;

/** One event; later calls get later times, so events stay in order. */
function event({ day, player = 'p1', session, ...fields }: EventSpec): GameEvent {
  minute += 1;
  const time = `${String(Math.floor(minute / 60) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  const identity = { playerId: player, sessionId: session ?? `${player}-${day}`, classCode: null };
  return makeEvent(identity, new Date(), {
    level: 1,
    set_index: 0,
    ...fields,
    at: `2026-11-${String(day).padStart(2, '0')}T${time}:00+07:00`,
  });
}

const deal = (day: number, extra: Partial<EventSpec> = {}): GameEvent =>
  event({ kind: 'deal', day, ...extra });
const clean = (day: number, wordId: string, extra: Partial<EventSpec> = {}): GameEvent =>
  event({ kind: 'match', outcome: 'clean', word_id: wordId, day, ...extra });

describe('S1, coming back', () => {
  it('counts a player as back the next day only when they played that day', () => {
    const result = comingBack([deal(1), deal(2), deal(1, { player: 'p2' })]);
    expect(result.backOnDay2).toEqual({ count: 1, total: 2 });
  });

  it('leaves day 7 out until the data reaches it', () => {
    expect(comingBack([deal(1), deal(2)]).backOnDay7).toEqual({ count: 0, total: 0 });
  });

  it('averages days of the first 14 only over players whose 14 days have passed', () => {
    const events = [deal(1), deal(2), deal(5), deal(15, { player: 'p2' }), deal(20)];
    const result = comingBack(events);
    expect(result.playersPastFirst14).toBe(1);
    expect(result.averageDaysOfFirst14).toBe(3);
  });

  it('does not count a day with only a check-up as a play day', () => {
    const checkUpOnly = event({ kind: 'check_up_right', check_up_role: 'before', day: 2 });
    expect(comingBack([deal(1), checkUpOnly]).backOnDay2).toEqual({ count: 0, total: 1 });
  });
});

describe('S4, loop balance', () => {
  it('counts a timed-out set once, however many words were left', () => {
    const timeouts = ['a', 'b', 'c'].map((wordId) =>
      event({ kind: 'timeout', word_id: wordId, day: 1, level: 5, set_index: 3 }),
    );
    expect(loopBalance([deal(1, { level: 5 }), ...timeouts]).levels[4]).toMatchObject({
      sets: 1,
      timedOutSets: 1,
    });
  });

  it('counts quitting within 2 sets of a drop from level 5, but not playing on', () => {
    // Two more sets and then leaving still counts as quitting within 2 sets.
    const quitter = [
      event({ kind: 'miss', day: 1, level: 5, session: 'q' }),
      deal(1, { session: 'q' }),
      deal(1, { session: 'q' }),
    ];
    const stayer = [
      event({ kind: 'miss', day: 1, level: 5, session: 's' }),
      ...[1, 2, 3].map(() => deal(1, { session: 's' })),
    ];
    const result = loopBalance([...quitter, ...stayer]);
    expect(result.dropsFromTop.count).toBe(2);
    expect(result.quitsAfterDrop).toBe(1);
  });
});

describe('S5, peeks', () => {
  it("scores a peeked word's next answer in a later set, not the match in its own set", () => {
    const events = [
      deal(1),
      event({ kind: 'peek', word_id: 'w', day: 1 }),
      event({ kind: 'match', outcome: 'peeked', word_id: 'w', day: 1 }),
      deal(1),
      clean(1, 'w'),
    ];
    expect(peekMeasure(events).peekedThenRight).toEqual({ count: 1, total: 1 });
  });

  it('counts a word peeked and missed in one set as peeked', () => {
    const events = [
      deal(1),
      event({ kind: 'peek', word_id: 'w', day: 1 }),
      event({ kind: 'miss', word_id: 'w', day: 1 }),
      deal(2),
      event({ kind: 'miss', word_id: 'w', day: 2 }),
    ];
    const result = peekMeasure(events);
    expect(result.peekedThenRight).toEqual({ count: 0, total: 1 });
    expect(result.missedThenRight).toEqual({ count: 0, total: 0 });
  });
});

describe('S6, check-up uptake', () => {
  it('is the share of play days that also had a check-up', () => {
    const checkUp = event({ kind: 'check_up_wrong', check_up_role: 'after', day: 1 });
    expect(checkUpUptake([deal(1), checkUp, deal(2)])).toEqual({ count: 1, total: 2 });
  });
});

describe('S2 and S3, measured against the deck', () => {
  const words = ['a', 'b', 'c'].map((id) => deckWord(id, `語${id}`, `ご${id}`));
  const decks = new Map([['N5', words]]);
  const levels = new Map([
    ['p1', 'N5'],
    ['p2', 'N5'],
  ]);

  it('counts a play day as complete when the daily deck ended cleared', () => {
    const checkUpOnly = event({ kind: 'check_up_right', check_up_role: 'before', day: 2 });
    const cleared = [deal(1), clean(1, 'a'), clean(1, 'b'), clean(1, 'c'), checkUpOnly];
    const unfinished = [deal(1, { player: 'p2' }), clean(1, 'a', { player: 'p2' })];
    expect(deckCompletion([...cleared, ...unfinished], levels, decks)).toEqual({
      count: 1,
      total: 2,
    });
  });

  it("predicts a player's misses better with the learned chance than with the guess", () => {
    // The deck guesses a 20% miss chance; this player misses word a every time.
    const misses = [1, 2, 3, 4, 5, 6].map((day) => event({ kind: 'miss', word_id: 'a', day }));
    const score = difficultyPredictions(misses, levels, decks);
    expect(score.attempts).toBe(5);
    expect(score.learnedLogLoss).toBeLessThan(score.guessLogLoss ?? 0);
  });
});

describe('the play report', () => {
  const quiet: PlayMeasures = {
    comingBack: comingBack([]),
    deckCompletion: null,
    predictions: null,
    loop: loopBalance([]),
    peeks: peekMeasure([]),
    checkUpUptake: { count: 2, total: 10 },
  };

  it('says the decks are missing rather than guessing S2 and S3', () => {
    expect(renderPlayReport(quiet)).toContain('Decks not found');
  });

  it('warns when the check-up is taken on under 30% of play days', () => {
    expect(renderPlayReport(quiet)).toContain('Below 30%');
  });

  it('calls the 5→1 rule too harsh when over 30% of drops end the session', () => {
    const loop = { ...loopBalance([]), dropsFromTop: { count: 10, total: 40 }, quitsAfterDrop: 4 };
    expect(renderPlayReport({ ...quiet, loop })).toContain('too harsh');
  });

  it('flags the level-5 timer when 40% or more of level-5 sets time out', () => {
    const levels = loopBalance([]).levels.map((row) =>
      row.level === 5 ? { ...row, sets: 20, timedOutSets: 8 } : row,
    );
    expect(renderPlayReport({ ...quiet, loop: { ...quiet.loop, levels } })).toContain(
      'timer looks too short',
    );
  });

  it('says the learned difficulty fails S3 when it beats the guess by under 5%', () => {
    const predictions = { attempts: 300, guessLogLoss: 0.5, learnedLogLoss: 0.49 };
    expect(renderPlayReport({ ...quiet, predictions })).toContain('does not beat the guess');
  });
});
