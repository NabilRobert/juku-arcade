import { describe, expect, it } from 'vitest';
import {
  dueNudge,
  isOverDailyCap,
  MAX_TICK_GAP_MS,
  parseCapMinutes,
  PLAY_SAVE_EVERY_MS,
  tickPlayClock,
  withPlayTime,
} from '../src/game/wellbeing.ts';

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

describe('the play clock, shared by both modes', () => {
  const record = { playDay: '2026-11-22', playMsToday: 0 };
  const clock = { lastTickMs: 0, lastSaveMs: 0 };
  const day = '2026-11-22';

  it('counts the time since the last tick as play', () => {
    const tick = tickPlayClock(clock, record, { ms: 100, day }, false);
    expect(tick.playedMs).toBe(100);
    expect(tick.record.playMsToday).toBe(100);
  });

  it('counts nothing while paused, and never a stalled tab as play', () => {
    expect(tickPlayClock(clock, record, { ms: 100, day }, true).playedMs).toBe(0);
    expect(tickPlayClock(clock, record, { ms: 60_000, day }, false).playedMs).toBe(MAX_TICK_GAP_MS);
  });

  it('asks for a save once enough time has passed since the last one', () => {
    const early = { lastTickMs: 1000, lastSaveMs: 0 };
    expect(tickPlayClock(early, record, { ms: 1100, day }, false).isSaveDue).toBe(false);
    const late = { lastTickMs: PLAY_SAVE_EVERY_MS, lastSaveMs: 0 };
    const due = tickPlayClock(late, record, { ms: PLAY_SAVE_EVERY_MS + 100, day }, false);
    expect(due.isSaveDue).toBe(true);
    expect(due.clock.lastSaveMs).toBe(PLAY_SAVE_EVERY_MS + 100);
  });
});
