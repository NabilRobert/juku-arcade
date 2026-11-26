/**
 * Each combo rank's text colour (game/combo-ranks.ts holds the ranks). It
 * warms rank by rank, from off-white through aqua and pinks to a bright
 * red at SSS, with a growing glow. The reds are brighter than the
 * palette's crimson, which is too dark to read on the navy table, so this
 * scale is its own and written out only here.
 */
import type { RankLetter } from '../../game/combo-ranks.ts';

export const RANK_COLOURS: Readonly<Record<RankLetter, string>> = {
  F: 'text-washi/70',
  E: 'text-washi',
  D: 'text-aqua',
  C: 'text-[#f4c2c8]',
  B: 'text-[#f09aa5]',
  A: 'text-[#ec7283] drop-shadow-[0_0_6px_rgb(236_114_131/0.6)]',
  S: 'text-[#e84a5f] drop-shadow-[0_0_8px_rgb(232_74_95/0.7)]',
  SS: 'text-[#e5283f] drop-shadow-[0_0_12px_rgb(229_40_63/0.8)]',
  SSS: 'text-[#ff1f3a] drop-shadow-[0_0_18px_rgb(255_31_58/1)]',
};
