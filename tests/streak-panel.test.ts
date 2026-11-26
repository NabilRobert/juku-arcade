// The streak on the start screen: the calendar's days, a day's summary, and the reminder.
import 'fake-indexeddb/auto';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import DayDetail from '../src/components/streak/DayDetail.vue';
import PlayCalendar from '../src/components/streak/PlayCalendar.vue';
import StreakPanel from '../src/components/streak/StreakPanel.vue';
import { localDay } from '../src/game/events.ts';
import type { DaySummary } from '../src/memory/day-summary.ts';
import { addDays } from '../src/memory/leitner.ts';
import { calendarWeeks } from '../src/memory/play-calendar.ts';
import { deleteAllData, saveRun } from '../src/memory/storage.ts';

const TODAY = '2026-11-26';
const emptyDeck = { level: 'N5' as const, sourceCommit: 'test', words: [], kanji: {} };

const quietDay: DaySummary = {
  runs: 0,
  minutes: 0,
  scores: [],
  words: { answered: 0, right: 0 },
  grammar: { answered: 0, right: 0 },
  newWords: 0,
  grammarPoints: 0,
  haikuIds: [],
  kanji: { mostRecognised: null, mostMissed: null },
};

describe('the play calendar on screen', () => {
  it('shades each day by its play, and picks a day when clicked', async () => {
    const run = {
      id: 'r',
      mode: 'words' as const,
      day: TODAY,
      startedAtMs: 0,
      lastPlayedAtMs: 0,
      score: 0,
      answered: 40,
      right: 40,
    };
    const calendar = mount(PlayCalendar, {
      props: { weeks: calendarWeeks([run], TODAY, 2), restDays: [], selected: TODAY, today: TODAY },
    });
    const today = calendar.find('[aria-label="Today: 40 answers"]');
    expect(today.attributes('data-shade')).toBe('3');
    await calendar.find('[aria-label="Yesterday: no play"]').trigger('click');
    expect(calendar.emitted('select')?.[0]).toEqual(['2026-11-25']);
  });

  it('leaves the days after today blank', () => {
    const calendar = mount(PlayCalendar, {
      props: { weeks: calendarWeeks([], TODAY, 1), restDays: [], selected: TODAY, today: TODAY },
    });
    // Thursday is today: Friday to Sunday are still to come.
    expect(calendar.findAll('button')).toHaveLength(4);
  });
});

describe("a day's summary on screen", () => {
  it('says when a quiet day was a rest day the streak forgave', () => {
    const detail = mount(DayDetail, {
      props: { day: '2026-11-24', today: TODAY, summary: quietDay, isRestDay: true },
    });
    expect(detail.text()).toContain('Rest day: your streak was kept.');
  });

  it('shows every haiku the day closed on, saying it was today', () => {
    const summary = { ...quietDay, runs: 2, haikuIds: ['old-pond', 'park-cat'] };
    const detail = mount(DayDetail, {
      props: { day: TODAY, today: TODAY, summary, isRestDay: false },
    });
    expect(detail.text()).toContain('Today you got these 2 haiku');
    expect(detail.find('[data-testid="day-haiku"]').findAll('article')).toHaveLength(2);
  });
});

describe("a day's kanji and scores on screen", () => {
  it("shows the day's most recognised and most missed kanji, and each mode's best", () => {
    const summary: DaySummary = {
      ...quietDay,
      runs: 1,
      scores: [{ mode: 'kanji', dayBest: 90, monthBest: 120, everBest: 300 }],
      kanji: { mostRecognised: { kanji: '学', count: 3 }, mostMissed: { kanji: '先', count: 2 } },
    };
    const detail = mount(DayDetail, {
      props: { day: TODAY, today: TODAY, summary, isRestDay: false },
    });
    expect(detail.find('[data-testid="most-recognised"]').text()).toContain('学 ×3');
    expect(detail.find('[data-testid="most-missed"]').text()).toContain('先 ×2');
    expect(detail.find('[data-mode="kanji"]').text()).toBe('Kanji90120300');
  });
});

describe('the streak panel', () => {
  beforeEach(async () => {
    await deleteAllData();
  });

  it('counts the streak from the play log and reminds the player to keep it', async () => {
    const today = localDay(new Date());
    for (const daysAgo of [1, 2]) {
      const day = addDays(today, -daysAgo);
      await saveRun({
        id: day,
        mode: 'kanji',
        day,
        startedAtMs: 0,
        lastPlayedAtMs: 0,
        score: 0,
        answered: 3,
        right: 2,
      });
    }
    const panel = mount(StreakPanel, { props: { deck: emptyDeck } });
    await flushPromises();
    expect(panel.find('[data-testid="streak-days"]').text()).toBe('2-day streak');
    expect(panel.find('[data-testid="streak-message"]').text()).toContain(
      '2-day streak! Play today',
    );
  });
});
