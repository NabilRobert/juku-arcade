// The stats page's numbers, worked out from the event log.
import { describe, expect, it } from 'vitest';
import { makeEvent, type GameEvent } from '../src/game/events.ts';
import { accuracy, countAnswers, playerStats } from '../src/memory/stats.ts';
import { deckWord } from './helpers/fixtures.ts';

const IDENTITY = { playerId: 'p', sessionId: 's', classCode: null };
const WORDS = [deckWord('1', '学校', 'がっこう'), deckWord('2', '先生', 'せんせい')];

function event(day: string, fields: Partial<GameEvent> & Pick<GameEvent, 'kind'>): GameEvent {
  return makeEvent(IDENTITY, new Date(`${day}T12:00:00`), { level: 1, set_index: 0, ...fields });
}

const EVENTS: GameEvent[] = [
  event('2026-11-21', { kind: 'deal' }),
  event('2026-11-21', { kind: 'match', word_id: '1', outcome: 'clean' }),
  event('2026-11-21', { kind: 'miss', word_id: '2', error_type: 'longVowel' }),
  event('2026-11-22', { kind: 'deal' }),
  event('2026-11-22', { kind: 'miss', word_id: '2', error_type: 'longVowel' }),
  event('2026-11-22', { kind: 'miss', word_id: '1', error_type: 'mixUp' }),
  event('2026-11-22', { kind: 'match', word_id: '2', outcome: 'peeked' }),
  event('2026-11-22', { kind: 'match', word_id: '1', outcome: 'after_miss' }),
];

describe('the stats page', () => {
  it('counts right answers and misses, but not a peeked match', () => {
    expect(countAnswers(EVENTS)).toEqual({ right: 2, wrong: 3, timedOut: 0 });
    expect(accuracy({ right: 2, wrong: 3, timedOut: 0 })).toBeCloseTo(0.4);
    expect(accuracy({ right: 0, wrong: 0, timedOut: 0 })).toBeNull();
  });

  it("splits out today's answers, and counts sets and days played", () => {
    const stats = playerStats(EVENTS, WORDS, '2026-11-22');
    expect(stats.today).toEqual({ right: 1, wrong: 2, timedOut: 0 });
    expect(stats.setsPlayed).toBe(2);
    expect(stats.daysPlayed).toBe(2);
  });

  it('lists the words missed most, and the kinds of mistake made most', () => {
    const stats = playerStats(EVENTS, WORDS, '2026-11-22');
    expect(stats.mostMissed[0]).toEqual({ word: '先生', reading: 'せんせい', misses: 2 });
    expect(stats.mistakes[0]?.count).toBe(2);
    expect(stats.mistakes[0]?.name).toContain('Long vowels');
  });
});
