/**
 * The combo's style ranks (D39): letter grades that climb as the combo
 * grows, each with a word of praise in easy Japanese, so even the cheering
 * is reading practice. Letter grades are a common way to score style in
 * action games; the words and thresholds here are our own. Bunpou's scoring
 * reads the ranks too, so they live with the game's rules; each rank's
 * colour is the UI's (components/ui/combo-rank-colours.ts).
 */

export type RankLetter = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface ComboRank {
  /** The combo this rank starts at. */
  from: number;
  letter: RankLetter;
  /** Its word of praise; what it means is a message (game.rankMeanings), by letter. */
  praise: string;
}

/** Lowest first, F up to SSS. One match isn't a streak yet, so the first rank starts at 2. */
export const COMBO_RANKS: readonly ComboRank[] = [
  { from: 2, letter: 'F', praise: 'がんばれ' },
  { from: 4, letter: 'E', praise: 'よし' },
  { from: 6, letter: 'D', praise: 'いいね' },
  { from: 9, letter: 'C', praise: 'うまい' },
  { from: 12, letter: 'B', praise: 'すごい' },
  { from: 15, letter: 'A', praise: 'さいこう' },
  { from: 20, letter: 'S', praise: 'かんぺき' },
  { from: 25, letter: 'SS', praise: 'てんさい' },
  { from: 30, letter: 'SSS', praise: 'でんせつ' },
];

export interface RankProgress {
  rank: ComboRank | null;
  /** How far the combo is from this rank to the next, 0 to 1; 1 at the top rank. */
  towardNext: number;
}

/** The rank a combo has reached, and how close it is to the next. */
export function rankFor(combo: number): RankProgress {
  const index = COMBO_RANKS.findLastIndex((rank) => combo >= rank.from);
  const rank = COMBO_RANKS[index] ?? null;
  const next = COMBO_RANKS[index + 1];
  if (rank === null || next === undefined) return { rank, towardNext: rank === null ? 0 : 1 };
  return { rank, towardNext: (combo - rank.from) / (next.from - rank.from) };
}
