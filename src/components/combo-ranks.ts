/**
 * The combo's style ranks (D39): letter grades that climb as the combo
 * grows, each with a word of praise in easy Japanese, so even the cheering
 * is reading practice. Letter grades are a common way to score style in
 * action games; the words and thresholds here are our own.
 */

export interface ComboRank {
  /** The combo this rank starts at. */
  from: number;
  letter: string;
  praise: string;
  /** What the praise means, for the card's title. */
  meaning: string;
  /** Text colour, and a glow so crimson still reads on the navy table. */
  colour: string;
}

/** Lowest first. One match isn't a streak yet, so the first rank starts at 2. */
export const COMBO_RANKS: readonly ComboRank[] = [
  { from: 2, letter: 'D', praise: 'よし', meaning: 'good', colour: 'text-washi' },
  { from: 5, letter: 'C', praise: 'いいね', meaning: 'nice', colour: 'text-aqua' },
  {
    from: 10,
    letter: 'B',
    praise: 'うまい',
    meaning: 'skilful',
    colour: 'text-aqua drop-shadow-[0_0_8px_rgb(168_218_220/0.7)]',
  },
  {
    from: 15,
    letter: 'A',
    praise: 'すごい',
    meaning: 'amazing',
    colour: 'text-crimson drop-shadow-[0_0_6px_rgb(241_250_238/0.9)]',
  },
  {
    from: 20,
    letter: 'S',
    praise: 'さいこう',
    meaning: 'the best',
    colour: 'text-crimson drop-shadow-[0_0_10px_rgb(241_250_238/1)]',
  },
  {
    from: 30,
    letter: 'SS',
    praise: 'てんさい',
    meaning: 'genius',
    colour: 'text-crimson drop-shadow-[0_0_14px_rgb(168_218_220/1)]',
  },
  {
    from: 40,
    letter: 'SSS',
    praise: 'でんせつ',
    meaning: 'legend',
    colour: 'text-washi drop-shadow-[0_0_16px_rgb(155_27_48/1)]',
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
