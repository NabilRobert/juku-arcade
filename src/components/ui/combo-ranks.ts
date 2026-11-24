/**
 * The combo's style ranks (D39): letter grades that climb as the combo
 * grows, each with a word of praise in easy Japanese, so even the cheering
 * is reading practice. Letter grades are a common way to score style in
 * action games; the words and thresholds here are our own.
 */

export type RankLetter = 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface ComboRank {
  /** The combo this rank starts at. */
  from: number;
  letter: RankLetter;
  praise: string;
  /** What the praise means, for the card's title. */
  meaning: string;
  /**
   * Text colour: it warms rank by rank, from off-white through aqua and
   * pinks to a bright red at SSS, with a growing glow. Brighter reds than
   * the palette's crimson, which is too dark to read on the navy table.
   */
  colour: string;
}

/** Lowest first, F up to SSS. One match isn't a streak yet, so the first rank starts at 2. */
export const COMBO_RANKS: readonly ComboRank[] = [
  { from: 2, letter: 'F', praise: 'がんばれ', meaning: 'keep going', colour: 'text-washi/70' },
  { from: 4, letter: 'E', praise: 'よし', meaning: 'good', colour: 'text-washi' },
  { from: 6, letter: 'D', praise: 'いいね', meaning: 'nice', colour: 'text-aqua' },
  {
    from: 9,
    letter: 'C',
    praise: 'うまい',
    meaning: 'skilful',
    colour: 'text-[#f4c2c8]',
  },
  {
    from: 12,
    letter: 'B',
    praise: 'すごい',
    meaning: 'amazing',
    colour: 'text-[#f09aa5]',
  },
  {
    from: 15,
    letter: 'A',
    praise: 'さいこう',
    meaning: 'the best',
    colour: 'text-[#ec7283] drop-shadow-[0_0_6px_rgb(236_114_131/0.6)]',
  },
  {
    from: 20,
    letter: 'S',
    praise: 'かんぺき',
    meaning: 'perfect',
    colour: 'text-[#e84a5f] drop-shadow-[0_0_8px_rgb(232_74_95/0.7)]',
  },
  {
    from: 25,
    letter: 'SS',
    praise: 'てんさい',
    meaning: 'genius',
    colour: 'text-[#e5283f] drop-shadow-[0_0_12px_rgb(229_40_63/0.8)]',
  },
  {
    from: 30,
    letter: 'SSS',
    praise: 'でんせつ',
    meaning: 'legend',
    colour: 'text-[#ff1f3a] drop-shadow-[0_0_18px_rgb(255_31_58/1)]',
  },
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
