/**
 * SPIKE: special cards in the bank run (our own, as omamori-style crests).
 * A few word cards each set carry a crest on their back, which only shows
 * while the player scouts (a limited pause). Matching a marked card right
 * pays out; the cursed one is a trap. Words the player has missed before
 * carry the good crests more often, so the rewards follow what the game is
 * teaching.
 */
import type { RandomSource } from '../game/deal.ts';
import type { DeckWord } from '../deck/types.ts';

export type CrestKind = 'koban' | 'omikuji' | 'cursed';

export interface Crest {
  kind: CrestKind;
  symbol: string;
  name: string;
  /** Tailwind classes for the crest on a card back. */
  colour: string;
  effect: string;
}

export const CRESTS: Record<CrestKind, Crest> = {
  koban: {
    kind: 'koban',
    symbol: '金',
    name: 'Koban',
    colour: 'bg-[#e9c46a] text-sumi',
    effect: 'Matched right: double coins for that match.',
  },
  omikuji: {
    kind: 'omikuji',
    symbol: '紫',
    name: 'Omikuji',
    colour: 'bg-[#9d6bd6] text-washi',
    effect: 'Matched right: a random gift of coins.',
  },
  cursed: {
    kind: 'cursed',
    symbol: '黒',
    name: 'Cursed',
    colour: 'bg-sumi text-[#ff1f3a]',
    effect: 'Missed: lose the pot and 5 coins from your wallet.',
  },
};

/** The chance a word card carries a crest: higher for words missed before. */
const CREST_CHANCE = 1 / 6;
const MISSED_BEFORE_CHANCE = 1 / 3;
/** At most this many crests in one set, so scouting stays a quick look. */
const MAX_CRESTS_PER_SET = 2;
/** A cursed card costs this many coins from the wallet when missed. */
export const CURSE_COST = 5;

/** A crest for a word: missed-before words only get good ones. */
function crestFor(isMissedBefore: boolean, random: RandomSource): CrestKind {
  const roll = random();
  if (isMissedBefore) return roll < 0.5 ? 'koban' : 'omikuji';
  if (roll < 0.4) return 'koban';
  return roll < 0.7 ? 'omikuji' : 'cursed';
}

/** Which of a set's word cards carry a crest, by word id. */
export function dealCrests(
  words: readonly DeckWord[],
  missedBefore: ReadonlySet<string>,
  random: RandomSource,
): Map<string, CrestKind> {
  const crests = new Map<string, CrestKind>();
  for (const word of words) {
    if (crests.size >= MAX_CRESTS_PER_SET) break;
    const isMissedBefore = missedBefore.has(word.id);
    const chance = isMissedBefore ? MISSED_BEFORE_CHANCE : CREST_CHANCE;
    if (random() < chance) crests.set(word.id, crestFor(isMissedBefore, random));
  }
  return crests;
}

/** An omikuji's gift: coins into the pot, or straight into the wallet. */
export type OmikujiGift = { to: 'pot' | 'wallet'; coins: number };

export function drawOmikuji(random: RandomSource): OmikujiGift {
  return random() < 0.5 ? { to: 'pot', coins: 10 } : { to: 'wallet', coins: 6 };
}
