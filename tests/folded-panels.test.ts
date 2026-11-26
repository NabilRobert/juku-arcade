// The start screen's leaderboard and streak panels fold down to their headline, and stay folded.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import LeaderboardPanel from '../src/components/LeaderboardPanel.vue';
import StreakPanel from '../src/components/streak/StreakPanel.vue';
import type { PlayHistory } from '../src/memory/day-summary.ts';
import { setLeaderboardFolded, setStreakFolded } from '../src/preferences/folded-panels.ts';

const NO_BESTS = { words: 0, kanji: 0, bunpou: 0, dojo: 0, total: 0 };
const NO_PLAY: PlayHistory = {
  runs: [],
  kanjiRounds: [],
  wordEvents: [],
  grammarEvents: [],
  wordTextById: new Map(),
};

afterEach(() => {
  setLeaderboardFolded(false);
  setStreakFolded(false);
});

describe('folding the leaderboard', () => {
  it('folds down to its title, and opens again', async () => {
    const panel = mount(LeaderboardPanel, { props: { bests: NO_BESTS } });
    expect(panel.find('[data-testid="fold-button"]').text()).toBe('Hide');
    await panel.find('[data-testid="fold-button"]').trigger('click');
    expect(panel.find('[data-testid="fold-button"]').text()).toBe('Show');
    expect(panel.text()).toContain('Leaderboard');
    expect(panel.find('[data-testid="leaderboard-rows"]').exists()).toBe(false);
    expect(panel.find('[data-testid="fold-button"]').attributes('aria-expanded')).toBe('false');
    await panel.find('[data-testid="fold-button"]').trigger('click');
    expect(panel.find('[data-testid="leaderboard-rows"]').exists()).toBe(true);
  });

  it('is remembered in this browser, so the start screen opens as the player left it', async () => {
    const panel = mount(LeaderboardPanel, { props: { bests: NO_BESTS } });
    await panel.find('[data-testid="fold-button"]').trigger('click');
    expect(localStorage.getItem('juku-arcade:leaderboard-folded')).toBe('true');
    const reopened = mount(LeaderboardPanel, { props: { bests: NO_BESTS } });
    expect(reopened.find('[data-testid="leaderboard-rows"]').exists()).toBe(false);
  });
});

describe('folding the streak', () => {
  it('hides the calendar but keeps the streak’s length in sight', async () => {
    const panel = mount(StreakPanel, { props: { history: NO_PLAY, today: '2026-11-26' } });
    await panel.find('[data-testid="fold-button"]').trigger('click');
    expect(panel.find('[data-testid="streak-days"]').exists()).toBe(true);
    expect(panel.find('[data-testid="play-calendar"]').exists()).toBe(false);
    expect(panel.find('[data-testid="streak-message"]').exists()).toBe(false);
  });
});
