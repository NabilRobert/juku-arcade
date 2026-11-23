// The start screen's leaderboard: sample players, with your best score ranked among them.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import LeaderboardPanel from '../src/components/LeaderboardPanel.vue';
import { leaderboard, SAMPLE_PLAYERS, TOP_ROWS } from '../src/leaderboard/leaderboard.ts';

const scoreAt = (index: number): number => SAMPLE_PLAYERS[index]?.score ?? 0;

describe('the leaderboard', () => {
  it('puts a top score first', () => {
    const rows = leaderboard(scoreAt(0) + 1);
    expect(rows[0]).toMatchObject({ rank: 1, name: 'You', isYou: true });
    expect(rows).toHaveLength(TOP_ROWS);
  });

  it('adds your row, with your rank, after the top rows when you are further down', () => {
    const rows = leaderboard(0);
    expect(rows).toHaveLength(TOP_ROWS + 1);
    expect(rows.at(-1)).toMatchObject({ isYou: true, rank: SAMPLE_PLAYERS.length + 1 });
  });

  it('gives a tie to the sample player, so you have to beat a score to pass it', () => {
    const rows = leaderboard(scoreAt(1));
    expect(rows.find((row) => row.isYou)?.rank).toBe(3);
  });

  it('ranks the rows 1, 2, 3 in order of score', () => {
    const scores = leaderboard(scoreAt(2) + 1).map((row) => row.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe('the leaderboard panel', () => {
  afterEach(() => localStorage.clear());

  it('shows your best from this browser, and says the other players are samples', () => {
    localStorage.setItem('juku-arcade:best-bank-score', String(scoreAt(0) + 10));
    const panel = mount(LeaderboardPanel);
    expect(panel.find('[data-testid="leaderboard-you"]').text()).toContain(String(scoreAt(0) + 10));
    expect(panel.text()).toContain('Sample players');
  });
});
