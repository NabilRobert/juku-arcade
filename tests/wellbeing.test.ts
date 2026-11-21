import { describe, expect, it } from 'vitest';
import { dueNudge, isOverDailyCap, parseCapMinutes, withPlayTime } from '../src/game/wellbeing.ts';

const MINUTE = 60_000;

describe('wellbeing', () => {
  it('suggests stopping after 15 minutes of play', () => {
    expect(dueNudge(14 * MINUTE, [])).toBeNull();
    expect(dueNudge(15 * MINUTE, [])).toBe(15);
  });

  it('suggests again at 30 minutes once the first nudge was shown', () => {
    expect(dueNudge(31 * MINUTE, [15])).toBe(30);
    expect(dueNudge(31 * MINUTE, [15, 30])).toBeNull();
  });

  it('caps the day only when the school set a cap', () => {
    expect(isOverDailyCap(90 * MINUTE, null)).toBe(false);
    expect(isOverDailyCap(29 * MINUTE, 30)).toBe(false);
    expect(isOverDailyCap(30 * MINUTE, 30)).toBe(true);
  });

  it("adds to today's play time and starts over on a new day", () => {
    const today = withPlayTime(
      { playDay: '2026-11-21', playMsToday: 5 * MINUTE },
      '2026-11-21',
      MINUTE,
    );
    expect(today.playMsToday).toBe(6 * MINUTE);
    expect(withPlayTime(today, '2026-11-22', MINUTE)).toEqual({
      playDay: '2026-11-22',
      playMsToday: MINUTE,
    });
  });

  it('reads a cap of whole positive minutes and ignores anything else', () => {
    expect(parseCapMinutes('30')).toBe(30);
    expect([
      parseCapMinutes(''),
      parseCapMinutes(undefined),
      parseCapMinutes('0'),
      parseCapMinutes('abc'),
    ]).toEqual([null, null, null, null]);
  });
});
