import { describe, expect, it } from 'vitest';
import type { PlayedRun } from '../src/memory/play-log.ts';
import { calendarWeeks, dayLabel, playedDays, shadeFor } from '../src/memory/play-calendar.ts';

const TODAY = '2026-11-26'; // a Thursday

function run(day: string, answered: number): PlayedRun {
  return {
    id: `${day}-${answered}`,
    mode: 'words',
    day,
    startedAtMs: 0,
    lastPlayedAtMs: 0,
    score: 0,
    answered,
    right: answered,
  };
}

describe('the play calendar', () => {
  it('counts a day as played only when a run had an answer', () => {
    expect(playedDays([run('2026-11-25', 0), run(TODAY, 3)])).toEqual(new Set([TODAY]));
  });

  it('shades a busier day brighter', () => {
    expect([0, 1, 9, 10, 30, 60, 200].map(shadeFor)).toEqual([0, 1, 1, 2, 3, 4, 4]);
  });

  it('lays out whole weeks from Monday, ending with the week that holds today', () => {
    const weeks = calendarWeeks([], TODAY, 2);
    expect(weeks.map((week) => week.length)).toEqual([7, 7]);
    expect(weeks[0]?.[0]?.day).toBe('2026-11-16');
    expect(weeks[1]?.[3]).toMatchObject({ day: TODAY, isFuture: false });
    expect(weeks[1]?.[4]).toMatchObject({ day: '2026-11-27', isFuture: true });
  });

  it("adds up a day's answers across its runs", () => {
    const weeks = calendarWeeks([run(TODAY, 8), run(TODAY, 4)], TODAY, 1);
    expect(weeks[0]?.[3]).toMatchObject({ answers: 12, shade: 2 });
  });

  it('names today and yesterday, and other days by their date', () => {
    expect(dayLabel(TODAY, TODAY)).toBe('Today');
    expect(dayLabel('2026-11-25', TODAY)).toBe('Yesterday');
    expect(dayLabel('2026-11-23', TODAY)).toBe('Mon 23 Nov');
  });
});
