import { describe, expect, it } from 'vitest';
import { calendarWeeks, playedDays } from '../src/memory/play-calendar.ts';
import { samplePlay } from '../src/memory/sample-play.ts';
import { streakOn } from '../src/memory/streak.ts';

describe('the placeholder play', () => {
  it("is a week's streak ending yesterday, whatever today is", () => {
    for (const today of ['2026-11-26', '2027-03-01']) {
      const streak = streakOn(playedDays(samplePlay(today).runs), today);
      expect(streak).toEqual({ days: 7, restDays: [], isTodayPlayed: false });
    }
  });

  it('plays a different amount each day, so the calendar shows several shades', () => {
    const today = '2026-11-26';
    const days = calendarWeeks(samplePlay(today).runs, today).flat();
    const shades = new Set(days.filter((day) => day.answers > 0).map((day) => day.shade));
    expect(shades.size).toBeGreaterThanOrEqual(3);
  });
});
