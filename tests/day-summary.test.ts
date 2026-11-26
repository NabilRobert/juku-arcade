import { describe, expect, it } from 'vitest';
import { summariseDay, type PlayHistory } from '../src/memory/day-summary.ts';
import { kanjiOfDay } from '../src/memory/kanji-tally.ts';
import type { PlayMode, PlayedRun } from '../src/memory/play-log.ts';
import { answer } from './helpers/events.ts';
import { sentence } from './helpers/grammar-events.ts';

const DAY = '2026-11-26';
const MINUTE = 60_000;

function run(mode: PlayMode, day: string, score: number, answered = 10, right = 8): PlayedRun {
  return {
    id: `${mode}-${day}-${score}`,
    mode,
    day,
    startedAtMs: 0,
    lastPlayedAtMs: 5 * MINUTE,
    score,
    answered,
    right,
  };
}

const history = (overrides: Partial<PlayHistory>): PlayHistory => ({
  runs: [],
  kanjiRounds: [],
  wordEvents: [],
  grammarEvents: [],
  wordTextById: new Map([
    ['w-gakkou', '学校'],
    ['w-gakusei', '学生'],
    ['w-sensei', '先生'],
  ]),
  ...overrides,
});

describe("a day's summary", () => {
  it('counts the runs and minutes played that day', () => {
    const summary = summariseDay(
      DAY,
      history({
        runs: [run('words', DAY, 50), run('kanji', DAY, 30), run('words', '2026-11-25', 90)],
      }),
    );
    expect([summary.runs, summary.minutes]).toEqual([2, 10]);
  });

  it('gives each mode played its best that day, that month and ever', () => {
    const runs = [
      run('words', DAY, 50),
      run('words', DAY, 70),
      run('words', '2026-11-02', 120),
      run('words', '2026-10-30', 300),
      run('bunpou', '2026-11-25', 900),
    ];
    expect(summariseDay(DAY, history({ runs })).scores).toEqual([
      { mode: 'words', dayBest: 70, monthBest: 120, everBest: 300 },
    ]);
  });

  it('adds up words and grammar answered, and the grammar points met', () => {
    const summary = summariseDay(
      DAY,
      history({
        runs: [
          run('words', DAY, 0, 10, 8),
          run('words', DAY, 0, 5, 5),
          run('bunpou', DAY, 0, 4, 3),
        ],
        grammarEvents: [
          sentence('wa', DAY, 'right'),
          sentence('wa', DAY, 'wrong'),
          sentence('o', DAY, 'right'),
          sentence('ni', '2026-11-25', 'right'),
        ],
      }),
    );
    expect([summary.words, summary.grammar, summary.grammarPoints]).toEqual([
      { answered: 15, right: 13 },
      { answered: 4, right: 3 },
      2,
    ]);
  });

  it('counts a word as new only on the day it was first answered', () => {
    const wordEvents = [
      answer('w-gakkou', '2026-11-25', 'clean'),
      answer('w-gakkou', DAY, 'miss'),
      answer('w-sensei', DAY, 'clean'),
    ];
    expect(summariseDay(DAY, history({ wordEvents })).newWords).toBe(1);
  });
});

it("lists the haiku that day's shows closed on, oldest first", () => {
  const later = { ...run('bunpou', DAY, 0), id: 'later', startedAtMs: 2, haikuId: 'basho-frog' };
  const earlier = { ...run('bunpou', DAY, 0), id: 'earlier', startedAtMs: 1, haikuId: 'park' };
  const unfinished = { ...run('bunpou', DAY, 0), id: 'unfinished' };
  const summary = summariseDay(DAY, history({ runs: [later, unfinished, earlier] }));
  expect(summary.haikuIds).toEqual(['park', 'basho-frog']);
});

describe("a day's kanji", () => {
  const texts = history({}).wordTextById;

  it('counts the kanji in matched words as recognised, and in missed words as missed', () => {
    const events = [
      answer('w-gakkou', DAY, 'clean'),
      answer('w-gakusei', DAY, 'clean'),
      answer('w-sensei', DAY, 'miss'),
      answer('w-sensei', DAY, 'timeout'),
      answer('w-gakkou', '2026-11-25', 'miss'),
    ];
    expect(kanjiOfDay(DAY, events, texts, [])).toEqual({
      mostRecognised: { kanji: '学', count: 2 },
      mostMissed: { kanji: '先', count: 2 },
    });
  });

  it("adds kanji mode's rounds: a perfect one recognised, any other missed", () => {
    const rounds = [
      { day: DAY, kanji: '日', isPerfect: true },
      { day: DAY, kanji: '日', isPerfect: true },
      { day: DAY, kanji: '本', isPerfect: false },
    ];
    expect(kanjiOfDay(DAY, [], texts, rounds)).toEqual({
      mostRecognised: { kanji: '日', count: 2 },
      mostMissed: { kanji: '本', count: 1 },
    });
  });

  it('has nothing to show on a day without play', () => {
    expect(kanjiOfDay(DAY, [], texts, [])).toEqual({ mostRecognised: null, mostMissed: null });
  });
});
