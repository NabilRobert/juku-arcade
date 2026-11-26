import { describe, expect, it } from 'vitest';
import {
  milestoneToday,
  nextMilestone,
  streakMessage,
  type StreakContext,
} from '../src/memory/streak-messages.ts';

const TODAY = '2026-11-26';
const first = (): number => 0;
const context = (days: number, isTodayPlayed: boolean, restDays: string[] = []): StreakContext => ({
  streak: { days, restDays, isTodayPlayed },
  today: TODAY,
  hasPlayed: true,
});

/** Every message that can show, by trying each pick in turn. */
function possibleIds(at: StreakContext): Set<string> {
  const ids = new Set<string>();
  for (let pick = 0; pick < 1; pick += 0.05) ids.add(streakMessage(at, null, () => pick).id);
  return ids;
}

describe('the streak reminder', () => {
  it('asks a new player to start a streak', () => {
    const fresh = { ...context(0, false), hasPlayed: false };
    expect(streakMessage(fresh, null, first)).toEqual({
      id: 'start',
      text: 'Play a run today to start a streak.',
    });
  });

  it("asks to keep an open streak going, naming tomorrow's count", () => {
    expect(streakMessage(context(2, false), null, first).text).toBe(
      '2-day streak! Play today to make it 3.',
    );
  });

  it('warns about losing a streak only once it is a few days long', () => {
    expect(possibleIds(context(2, false))).not.toContain('dont-lose');
    expect(possibleIds(context(5, false))).toContain('dont-lose');
  });

  it("says when yesterday's rest day saved the streak", () => {
    expect(possibleIds(context(4, false, ['2026-11-25']))).toContain('rest-saved');
    expect(possibleIds(context(4, false, ['2026-11-23']))).not.toContain('rest-saved');
  });

  it('thanks a player who has played today, and names a milestone that is close', () => {
    expect(possibleIds(context(5, true))).toEqual(new Set(['done-today', 'milestone-near']));
    expect(possibleIds(context(8, true))).toEqual(new Set(['done-today']));
  });

  it('skips the message shown last time when another fits', () => {
    expect(streakMessage(context(5, false), 'keep-going', first).id).not.toBe('keep-going');
  });
});

describe('streak milestones', () => {
  it('are celebrated on the day they are reached', () => {
    expect(milestoneToday({ days: 7, restDays: [], isTodayPlayed: true })).toBe(7);
    expect(milestoneToday({ days: 7, restDays: [], isTodayPlayed: false })).toBeNull();
    expect(milestoneToday({ days: 8, restDays: [], isTodayPlayed: true })).toBeNull();
  });

  it('come next at the first one past the streak', () => {
    expect([nextMilestone(0), nextMilestone(7), nextMilestone(400)]).toEqual([3, 14, null]);
  });
});
