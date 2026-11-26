/**
 * The start screen's leaderboards (D47, D62), with sample players until
 * there's a server to share real scores: one for each mode, ranking its
 * best run (word mode's banked coins, kanji mode's best sheet, Bunpou's
 * best show, the dojo's best run), and a Total board, the sum of each
 * mode's best, which rewards being good at everything rather than playing
 * longest. Each ranks your best from this browser among its samples and
 * splits the ranking into pages the panel flips through with Back and
 * Next.
 */
import type { PlayMode, PlayedRun } from '../memory/play-log.ts';
import { BUNPOU_BEST_KEY } from '../memory/progress-keys.ts';

export type BoardId = PlayMode | 'total';
export const MODE_BOARDS: readonly PlayMode[] = ['words', 'kanji', 'bunpou', 'dojo'];
type Samples = readonly { name: string; score: number }[];

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  isYou: boolean;
}

/** Made-up players (animals, in Japanese), so the board isn't empty. Clearly not real people. */
export const SAMPLE_PLAYERS: Samples = [
  { name: 'Kitsune', score: 4820 },
  { name: 'Tanuki', score: 4150 },
  { name: 'Usagi', score: 3760 },
  { name: 'Neko', score: 3310 },
  { name: 'Tsuru', score: 2980 },
  { name: 'Kame', score: 2640 },
  { name: 'Inu', score: 2290 },
  { name: 'Risu', score: 1970 },
  { name: 'Fukurou', score: 1720 },
  { name: 'Koi', score: 1480 },
  { name: 'Saru', score: 1260 },
  { name: 'Kuma', score: 1090 },
  { name: 'Shika', score: 930 },
  { name: 'Tora', score: 810 },
  { name: 'Hebi', score: 690 },
  { name: 'Uma', score: 580 },
  { name: 'Hitsuji', score: 470 },
  { name: 'Tori', score: 390 },
  { name: 'Nezumi', score: 300 },
  { name: 'Kaeru', score: 220 },
  { name: 'Hachi', score: 150 },
  { name: 'Kani', score: 90 },
  { name: 'Tako', score: 40 },
];

/** Bunpou's sample players: a run scores 100 a line times the combo rank, so its scores run higher. */
export const BUNPOU_SAMPLE_PLAYERS: Samples = [
  { name: 'Kitsune', score: 9600 },
  { name: 'Fukurou', score: 8150 },
  { name: 'Tanuki', score: 7300 },
  { name: 'Tsuru', score: 6400 },
  { name: 'Usagi', score: 5525 },
  { name: 'Koi', score: 4800 },
  { name: 'Neko', score: 4100 },
  { name: 'Kame', score: 3450 },
  { name: 'Shika', score: 2900 },
  { name: 'Risu', score: 2350 },
  { name: 'Kuma', score: 1900 },
  { name: 'Hachi', score: 1500 },
  { name: 'Tori', score: 1150 },
  { name: 'Kaeru', score: 800 },
  { name: 'Tako', score: 450 },
];

/** Kanji mode's sample players: a sheet of 10 scores up to about 500. */
export const KANJI_SAMPLE_PLAYERS: Samples = [
  { name: 'Tsuru', score: 520 },
  { name: 'Kitsune', score: 470 },
  { name: 'Risu', score: 430 },
  { name: 'Usagi', score: 390 },
  { name: 'Tanuki', score: 350 },
  { name: 'Kame', score: 320 },
  { name: 'Neko', score: 280 },
  { name: 'Shika', score: 250 },
  { name: 'Koi', score: 210 },
  { name: 'Kuma', score: 180 },
  { name: 'Inu', score: 150 },
  { name: 'Tori', score: 120 },
  { name: 'Hachi', score: 90 },
  { name: 'Kaeru', score: 60 },
  { name: 'Tako', score: 30 },
];

/** The dojo's sample players: a run scores one point a right answer. */
export const DOJO_SAMPLE_PLAYERS: Samples = [
  { name: 'Fukurou', score: 84 },
  { name: 'Kitsune', score: 71 },
  { name: 'Tsuru', score: 63 },
  { name: 'Tanuki', score: 55 },
  { name: 'Kame', score: 48 },
  { name: 'Usagi', score: 42 },
  { name: 'Risu', score: 37 },
  { name: 'Neko', score: 31 },
  { name: 'Koi', score: 26 },
  { name: 'Shika', score: 22 },
  { name: 'Kuma', score: 18 },
  { name: 'Inu', score: 14 },
  { name: 'Tori', score: 10 },
  { name: 'Kaeru', score: 7 },
  { name: 'Tako', score: 4 },
];

/** Each mode's sample players. */
const MODE_SAMPLES: Readonly<Record<PlayMode, Samples>> = {
  words: SAMPLE_PLAYERS,
  kanji: KANJI_SAMPLE_PLAYERS,
  bunpou: BUNPOU_SAMPLE_PLAYERS,
  dojo: DOJO_SAMPLE_PLAYERS,
};

/** The Total board's samples: each sample player's scores on every mode's board, added up. */
function totalSamples(): Samples {
  const totals = new Map<string, number>();
  for (const samples of Object.values(MODE_SAMPLES)) {
    for (const { name, score } of samples) totals.set(name, (totals.get(name) ?? 0) + score);
  }
  return [...totals].map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score);
}

export const BOARD_SAMPLES: Readonly<Record<BoardId, Samples>> = {
  ...MODE_SAMPLES,
  total: totalSamples(),
};

/**
 * Your best on every board: each mode's best run in the play log, or a best
 * kept from before the play log existed (`legacy`), whichever is higher;
 * and the Total, those bests added up.
 */
export function boardBests(
  runs: readonly PlayedRun[],
  legacy: Partial<Record<PlayMode, number>> = {},
): Record<BoardId, number> {
  const bests = { words: 0, kanji: 0, bunpou: 0, dojo: 0, total: 0 };
  for (const mode of MODE_BOARDS) {
    const logged = runs.filter((run) => run.mode === mode).map((run) => run.score);
    bests[mode] = Math.max(legacy[mode] ?? 0, ...logged);
  }
  bests.total = MODE_BOARDS.reduce((sum, mode) => sum + bests[mode], 0);
  return bests;
}

/** Your best Bunpou run in this browser, for its leaderboard. */
export function readBunpouBest(): number {
  try {
    return Number(localStorage.getItem(BUNPOU_BEST_KEY) ?? 0);
  } catch {
    return 0;
  }
}

/** Keeps a run's score if it beats your best; true when it did. */
export function recordBunpouBest(score: number): boolean {
  if (score <= readBunpouBest()) return false;
  try {
    localStorage.setItem(BUNPOU_BEST_KEY, String(score));
  } catch {
    // Storage can be blocked (a private window); the best then lasts this visit.
  }
  return true;
}

/** Rows on one page of the panel. */
export const ROWS_PER_PAGE = 8;

/**
 * Every player ranked by score, with you among them. A tie goes to the
 * sample player, so you have to beat a score to pass it.
 */
export function rankedPlayers(
  yourBest: number,
  samples: Samples = SAMPLE_PLAYERS,
): LeaderboardRow[] {
  const players = samples.map((player) => ({ ...player, isYou: false }));
  const yourPlace = players.filter((player) => player.score >= yourBest).length;
  players.splice(yourPlace, 0, { name: 'You', score: yourBest, isYou: true });
  return players.map((player, index) => ({ ...player, rank: index + 1 }));
}

export function pageCount(rows: readonly LeaderboardRow[]): number {
  return Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
}

/** One page of the ranking (the first page is 0). */
export function pageOf(rows: readonly LeaderboardRow[], page: number): LeaderboardRow[] {
  return rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);
}
