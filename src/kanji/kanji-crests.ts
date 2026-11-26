/**
 * Crests in kanji mode (D42): the bank run's crests (bank-run/crests.ts)
 * as score bonuses, since kanji mode has no pot. A round may hide a good
 * crest on one right reading and a curse on one wrong reading; the player
 * sees them only by scouting (useKanjiCrests.ts), which flips the hand
 * over. A koban picked right doubles that card's points, an omikuji picked
 * right adds a random bonus, and a cursed card picked costs points.
 */
import { pickOne } from '../game/random.ts';
import type { RandomSource } from '../game/deal.ts';
import { CRESTS, type CrestKind } from '../bank-run/crests.ts';
import { POINTS_PER_HIT, type KanjiRound } from './kanji-round.ts';

/** The chance a round hides a good crest, and a curse. */
const GOOD_CREST_CHANCE = 0.5;
const CURSE_CHANCE = 0.35;
/** An omikuji's bonus is a whole number of points in this range. */
const OMIKUJI_MIN = 5;
const OMIKUJI_MAX = 15;
/** What picking a cursed card costs. */
export const CURSE_POINTS = 10;
/** Scouts at the start of a run, and the most a player can hold; a perfect round earns one. */
export const SCOUTS_AT_START = 2;
export const MAX_SCOUTS = 3;

/** What each crest does in kanji mode, for the Scout button's tooltip. */
export const KANJI_CREST_EFFECTS: Record<CrestKind, string> = {
  koban: `Picked right: double points for that reading.`,
  omikuji: `Picked right: a bonus of ${OMIKUJI_MIN} to ${OMIKUJI_MAX} points.`,
  cursed: `Picked: lose ${CURSE_POINTS} points. It's always a wrong reading.`,
};

/** Which of a round's cards carry a crest, by their place in the hand. */
export function dealKanjiCrests(round: KanjiRound, random: RandomSource): Map<number, CrestKind> {
  const crests = new Map<number, CrestKind>();
  const rights = round.cards.flatMap((card, index) => (card.isRight ? [index] : []));
  const wrongs = round.cards.flatMap((card, index) => (card.isRight ? [] : [index]));
  if (random() < GOOD_CREST_CHANCE) {
    const index = pickOne(rights, random);
    if (index !== undefined) crests.set(index, random() < 0.5 ? 'koban' : 'omikuji');
  }
  if (random() < CURSE_CHANCE) {
    const index = pickOne(wrongs, random);
    if (index !== undefined) crests.set(index, 'cursed');
  }
  return crests;
}

export interface CrestBonus {
  points: number;
  label: string;
}

/** What a thrown card's crest is worth, or null when it has none or it doesn't apply. */
export function crestBonus(
  crest: CrestKind | undefined,
  isRight: boolean,
  random: RandomSource,
): CrestBonus | null {
  if (crest === 'koban' && isRight) {
    return { points: POINTS_PER_HIT, label: `${CRESTS.koban.symbol} Koban! +${POINTS_PER_HIT}` };
  }
  if (crest === 'omikuji' && isRight) {
    const points = OMIKUJI_MIN + Math.floor(random() * (OMIKUJI_MAX - OMIKUJI_MIN + 1));
    return { points, label: `${CRESTS.omikuji.symbol} Omikuji! +${points}` };
  }
  if (crest === 'cursed' && !isRight) {
    return { points: -CURSE_POINTS, label: `${CRESTS.cursed.symbol} Cursed! −${CURSE_POINTS}` };
  }
  return null;
}
