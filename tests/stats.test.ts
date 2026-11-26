// The stats page's numbers, worked out from the event log.
import { mount } from '@vue/test-utils';
import { sentence } from './helpers/grammar-events.ts';
import { afterEach, describe, expect, it } from 'vitest';
import StatsPage from '../src/components/StatsPage.vue';
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

describe('the stats page on screen', () => {
  afterEach(() => localStorage.clear());

  it('shows the best score: the most banked coins reached in this browser', () => {
    localStorage.setItem('juku-arcade:best-bank-score', '840');
    const settings = {
      playerId: 'p',
      level: 'N5' as const,
      classCode: null,
      bestCombo: 12,
      playDay: null,
      playMsToday: 0,
      checkUpOfferedDay: null,
    };
    const deck = { level: 'N5' as const, sourceCommit: 'test', words: WORDS, kanji: {} };
    const page = mount(StatsPage, { props: { deck, settings, events: EVENTS, grammarEvents: [] } });
    expect(page.text()).toContain('Best score');
    expect(page.text()).toContain('840');
    expect(page.text()).not.toContain('Best set');
  });

  it('shows the grammar too: points known, sentences right, and the points missed most by pattern', () => {
    const settings = {
      playerId: 'p',
      level: 'N5' as const,
      classCode: null,
      bestCombo: 0,
      playDay: null,
      playMsToday: 0,
      checkUpOfferedDay: null,
    };
    const deck = { level: 'N5' as const, sourceCommit: 'test', words: WORDS, kanji: {} };
    const grammarEvents = [
      sentence('wa', '2026-11-25', 'right'),
      sentence('o', '2026-11-25', 'wrong'),
    ];
    const page = mount(StatsPage, { props: { deck, settings, events: [], grammarEvents } });
    const grammar = page.find('[data-testid="grammar-stats"]');
    expect(grammar.text()).toContain('Grammar known0 / 20');
    expect(grammar.text()).toContain('Grammar missed most');
    expect(grammar.text()).toContain('1×');
    expect(grammar.text()).toContain('The verb not at the end');
  });
});
