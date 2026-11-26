// The start screen's leaderboard: sample players with your best ranked among them, a page at a time.
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import LeaderboardPanel from '../src/components/LeaderboardPanel.vue';
import type { PlayedRun } from '../src/memory/play-log.ts';
import {
  BOARD_SAMPLES,
  boardBests,
  BUNPOU_SAMPLE_PLAYERS,
  pageCount,
  pageOf,
  rankedPlayers,
  readBunpouBest,
  recordBunpouBest,
  ROWS_PER_PAGE,
  SAMPLE_PLAYERS,
} from '../src/leaderboard/leaderboard.ts';

const scoreAt = (index: number): number => SAMPLE_PLAYERS[index]?.score ?? 0;
const NO_BESTS = { words: 0, kanji: 0, bunpou: 0, dojo: 0, total: 0 };
const mountPanel = (bests = NO_BESTS) => mount(LeaderboardPanel, { props: { bests } });

function run(mode: PlayedRun['mode'], score: number): PlayedRun {
  return {
    id: `${mode}-${score}`,
    mode,
    day: '2026-11-26',
    startedAtMs: 0,
    lastPlayedAtMs: 0,
    score,
    answered: 1,
    right: 1,
  };
}

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
    const panel = mountPanel();
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
    const panel = mountPanel({ ...NO_BESTS, words: scoreAt(0) + 10 });
    expect(panel.find('[data-testid="leaderboard-you"]').text()).toContain(String(scoreAt(0) + 10));
    expect(panel.text()).toContain('Sample players');
  });
});

describe('the Bunpou board', () => {
  afterEach(() => localStorage.clear());

  it('ranks your best run among its own sample players', () => {
    recordBunpouBest(5000);
    const you = rankedPlayers(readBunpouBest(), BUNPOU_SAMPLE_PLAYERS).find((row) => row.isYou);
    expect(you?.rank).toBe(6);
  });

  it('keeps only a run that beats your best', () => {
    expect(recordBunpouBest(1200)).toBe(true);
    expect(recordBunpouBest(800)).toBe(false);
    expect(readBunpouBest()).toBe(1200);
  });

  it('switches the start screen’s panel to Bunpou’s board', async () => {
    const panel = mountPanel();
    await panel.find('[data-testid="board-bunpou"]').trigger('click');
    const firstRow = panel.find('[data-testid="leaderboard-rows"] li').text();
    expect(firstRow).toContain(String(BUNPOU_SAMPLE_PLAYERS[0]?.score));
  });
});

describe('the boards for every mode, and the Total', () => {
  it('takes each mode’s best run from the play log, or an older best if higher', () => {
    const runs = [run('words', 300), run('words', 120), run('kanji', 210), run('dojo', 12)];
    expect(boardBests(runs, { words: 450, bunpou: 900 })).toEqual({
      words: 450,
      kanji: 210,
      bunpou: 900,
      dojo: 12,
      // Practice mode isn't timed, so it's left out of the Total (D71).
      total: 450 + 210 + 900,
    });
  });

  it('adds up each sample player’s timed-mode scores for the Total board, highest first', () => {
    const total = BOARD_SAMPLES.total;
    const kitsune = ['words', 'kanji', 'bunpou'].reduce((sum, board) => {
      const samples = BOARD_SAMPLES[board as keyof typeof BOARD_SAMPLES];
      return sum + (samples.find((player) => player.name === 'Kitsune')?.score ?? 0);
    }, 0);
    expect(total.find((player) => player.name === 'Kitsune')?.score).toBe(kitsune);
    expect(total.map((player) => player.score)).toEqual(
      [...total.map((player) => player.score)].sort((a, b) => b - a),
    );
  });

  it('switches to each board, ranking your best there', async () => {
    const panel = mountPanel({ ...NO_BESTS, dojo: 50, total: 99_999 });
    await panel.find('[data-testid="board-dojo"]').trigger('click');
    expect(panel.find('[data-testid="leaderboard-you"]').text()).toContain('50');
    await panel.find('[data-testid="board-total"]').trigger('click');
    expect(panel.find('[data-testid="leaderboard-you"]').text()).toMatch(/^1\./);
  });
});
