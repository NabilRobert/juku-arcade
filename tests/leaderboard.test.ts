// The start screen's leaderboard: sample players with your best ranked among them, a page at a time.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import LeaderboardPanel from '../src/components/LeaderboardPanel.vue';
import {
  pageCount,
  pageOf,
  rankedPlayers,
  ROWS_PER_PAGE,
  SAMPLE_PLAYERS,
} from '../src/leaderboard/leaderboard.ts';

const scoreAt = (index: number): number => SAMPLE_PLAYERS[index]?.score ?? 0;

describe('the leaderboard ranking', () => {
  it('puts a top score first', () => {
    expect(rankedPlayers(scoreAt(0) + 1)[0]).toMatchObject({ rank: 1, name: 'You', isYou: true });
  });

  it('ranks everyone, with you last on no score', () => {
    const rows = rankedPlayers(0);
    expect(rows).toHaveLength(SAMPLE_PLAYERS.length + 1);
    expect(rows.at(-1)).toMatchObject({ isYou: true, rank: SAMPLE_PLAYERS.length + 1 });
  });

  it('gives a tie to the sample player, so you have to beat a score to pass it', () => {
    expect(rankedPlayers(scoreAt(1)).find((row) => row.isYou)?.rank).toBe(3);
  });

  it('splits the ranking into pages of ROWS_PER_PAGE, the last one shorter', () => {
    const rows = rankedPlayers(0);
    expect(pageCount(rows)).toBe(Math.ceil(rows.length / ROWS_PER_PAGE));
    expect(pageOf(rows, 0).map((row) => row.rank)[0]).toBe(1);
    expect(pageOf(rows, 1)[0]?.rank).toBe(ROWS_PER_PAGE + 1);
    expect(pageOf(rows, pageCount(rows) - 1).at(-1)?.isYou).toBe(true);
  });
});

describe('the leaderboard panel', () => {
  afterEach(() => localStorage.clear());

  it('shows the first page, and Back and Next turn the pages within bounds', async () => {
    const panel = mount(LeaderboardPanel);
    const pages = pageCount(rankedPlayers(0));
    expect(panel.find('[data-testid="leaderboard-page"]').text()).toBe(`1 / ${pages}`);
    expect(panel.find('[data-testid="leaderboard-back"]').attributes('disabled')).toBeDefined();
    await panel.find('[data-testid="leaderboard-next"]').trigger('click');
    expect(panel.find('[data-testid="leaderboard-page"]').text()).toBe(`2 / ${pages}`);
    expect(panel.findAll('[data-testid="leaderboard-rows"] li')[0]?.text()).toContain(
      `${ROWS_PER_PAGE + 1}.`,
    );
    await panel.find('[data-testid="leaderboard-back"]').trigger('click');
    expect(panel.find('[data-testid="leaderboard-page"]').text()).toBe(`1 / ${pages}`);
  });

  it('shows your best from this browser, and says the other players are samples', () => {
    localStorage.setItem('juku-arcade:best-bank-score', String(scoreAt(0) + 10));
    const panel = mount(LeaderboardPanel);
    expect(panel.find('[data-testid="leaderboard-you"]').text()).toContain(String(scoreAt(0) + 10));
    expect(panel.text()).toContain('Sample players');
  });
});
