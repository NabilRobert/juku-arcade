import { describe, expect, it } from 'vitest';
import { weekStartOf } from '../src/memory/days.ts';
import { streakOn } from '../src/memory/streak.ts';

// 2026-11-26 is a Thursday; its week starts Monday 2026-11-23.
const TODAY = '2026-11-26';
const played = (...days: string[]): Set<string> => new Set(days);

describe('the streak', () => {
  it('starts each week on a Monday', () => {
    expect(weekStartOf('2026-11-26')).toBe('2026-11-23');
    expect(weekStartOf('2026-11-23')).toBe('2026-11-23');
    expect(weekStartOf('2026-11-29')).toBe('2026-11-23');
  });

  it('is nothing before any play', () => {
    expect(streakOn(played(), TODAY)).toEqual({ days: 0, restDays: [], isTodayPlayed: false });
  });

  it('counts days played in a row up to today', () => {
    expect(streakOn(played('2026-11-24', '2026-11-25', TODAY), TODAY).days).toBe(3);
  });

  it('is not broken by today, while today can still be played', () => {
    const streak = streakOn(played('2026-11-24', '2026-11-25'), TODAY);
    expect(streak).toEqual({ days: 2, restDays: [], isTodayPlayed: false });
  });

  it('forgives one missed day in a week, without counting it', () => {
    const streak = streakOn(played('2026-11-23', '2026-11-25', TODAY), TODAY);
    expect(streak).toEqual({ days: 3, restDays: ['2026-11-24'], isTodayPlayed: true });
  });

  it('is broken by a second missed day in the same week', () => {
    // 11-24 is forgiven; 11-22 is in the week before, but 11-23 is the second miss this week.
    expect(streakOn(played('2026-11-22', '2026-11-25', TODAY), TODAY).days).toBe(2);
  });

  it('forgives a missed day in each week', () => {
    // Missed 11-18 (week of 11-16) and 11-24 (week of 11-23).
    const days = played('2026-11-17', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22');
    ['2026-11-23', '2026-11-25', TODAY].forEach((day) => days.add(day));
    const streak = streakOn(days, TODAY);
    expect(streak.days).toBe(8);
    expect(streak.restDays).toEqual(['2026-11-24', '2026-11-18']);
  });

  it('keeps no rest day from before the streak began', () => {
    // 11-25 would be forgiven, but 11-24 breaks the streak, so 11-25 bridges nothing.
    expect(streakOn(played('2026-11-20', TODAY), TODAY)).toEqual({
      days: 1,
      restDays: [],
      isTodayPlayed: true,
    });
  });
});
