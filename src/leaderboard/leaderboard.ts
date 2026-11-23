/**
 * The start screen's leaderboard (D47), with sample players until there's
 * a server to share real scores. It ranks scores (banked coins, D46), puts
 * your best from this browser among them, and splits the ranking into
 * pages the panel flips through with Back and Next.
 */

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  isYou: boolean;
}

/** Made-up players (animals, in Japanese), so the board isn't empty. Clearly not real people. */
export const SAMPLE_PLAYERS: readonly { name: string; score: number }[] = [
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

/** Rows on one page of the panel. */
export const ROWS_PER_PAGE = 8;

/**
 * Every player ranked by score, with you among them. A tie goes to the
 * sample player, so you have to beat a score to pass it.
 */
export function rankedPlayers(yourBest: number): LeaderboardRow[] {
  const players = SAMPLE_PLAYERS.map((player) => ({ ...player, isYou: false }));
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
