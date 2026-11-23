/**
 * Crests on the bank run's cards (our own, omamori-style).
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
  /** The colour of the crest's seal on a card back: its ring and symbol, on a light disc. */
  ink: string;
  /** The crest's colour on a scouted card's frames and back (crest-mark.ts). */
  tint: string;
  effect: string;
}

export const CRESTS: Record<CrestKind, Crest> = {
  koban: {
    kind: 'koban',
    symbol: '金',
    name: 'Koban',
    ink: '#a87a12',
    tint: '#d4a73a',
    effect: 'Matched right: double coins for that match.',
  },
  omikuji: {
    kind: 'omikuji',
    symbol: '紫',
    name: 'Omikuji',
    ink: '#6a3aa6',
    tint: '#7d4cb8',
    effect: 'Matched right: a random gift of coins.',
  },
  cursed: {
    kind: 'cursed',
    symbol: '黒',
    name: 'Cursed',
    ink: '#2a0d14',
    tint: '#2a0d14',
    effect: 'Missed: lose the pot and 30 of your banked coins.',
  },
};

/** The chance a word card carries a crest: higher for words missed before. */
const CREST_CHANCE = 1 / 6;
const MISSED_BEFORE_CHANCE = 1 / 3;
/** At most this many crests in one set, so scouting stays a quick look. */
const MAX_CRESTS_PER_SET = 2;
/** A cursed card costs this many banked coins when missed. */
export const CURSE_COST = 30;

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

/** An omikuji's gift: coins into the pot, or straight into your banked coins. */
export type OmikujiGift = { to: 'pot' | 'coins'; coins: number };

export function drawOmikuji(random: RandomSource): OmikujiGift {
  return random() < 0.5 ? { to: 'pot', coins: 50 } : { to: 'coins', coins: 30 };
}
