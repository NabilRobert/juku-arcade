/**
 * The start screen's leaderboard (D47), with sample players until there's
 * a server to share real scores. It ranks scores (banked coins, D46) and
 * puts your best from this browser among them.
 */

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  isYou: boolean;
}

/** Made-up players, so the board isn't empty. Clearly not real people. */
export const SAMPLE_PLAYERS: readonly { name: string; score: number }[] = [
  { name: 'Kitsune', score: 2480 },
  { name: 'Tanuki', score: 1960 },
  { name: 'Usagi', score: 1510 },
  { name: 'Neko', score: 1230 },
  { name: 'Tsuru', score: 940 },
  { name: 'Kame', score: 720 },
  { name: 'Inu', score: 530 },
  { name: 'Risu', score: 380 },
  { name: 'Fukurou', score: 210 },
  { name: 'Koi', score: 90 },
];

/** How many rows the panel shows; your own row is added below them if you're further down. */
export const TOP_ROWS = 5;

/**
 * The top rows, with you ranked among the sample players. If your best
 * doesn't make the top rows, your row comes after them, with your rank.
 * A tie goes to the sample player, so you have to beat a score to pass it.
 */
export function leaderboard(yourBest: number): LeaderboardRow[] {
  const players = SAMPLE_PLAYERS.map((player) => ({ ...player, isYou: false }));
  const yourPlace = players.filter((player) => player.score >= yourBest).length;
  players.splice(yourPlace, 0, { name: 'You', score: yourBest, isYou: true });
  const ranked = players.map((player, index) => ({ ...player, rank: index + 1 }));
  const top = ranked.slice(0, TOP_ROWS);
  const you = ranked[yourPlace];
  return you === undefined || yourPlace < TOP_ROWS ? top : [...top, you];
}
