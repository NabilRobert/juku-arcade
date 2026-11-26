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
import { translate } from '../i18n/index.ts';
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

/** What a crest does in kanji mode, for the Scout button's tooltip; call it while rendering. */
export function kanjiCrestEffect(kind: CrestKind): string {
  return translate(`kanji.crestEffects.${kind}`, {
    min: OMIKUJI_MIN,
    max: OMIKUJI_MAX,
    points: CURSE_POINTS,
  });
}

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
  /** The notice it floats up, translated when the card is thrown. */
  label: string;
}

/** The points a thrown card's crest adds (or, cursed, takes), or null when it doesn't apply. */
function bonusPoints(crest: CrestKind, isRight: boolean, random: RandomSource): number | null {
  if (crest === 'koban' && isRight) return POINTS_PER_HIT;
  if (crest === 'omikuji' && isRight) {
    return OMIKUJI_MIN + Math.floor(random() * (OMIKUJI_MAX - OMIKUJI_MIN + 1));
  }
  if (crest === 'cursed' && !isRight) return -CURSE_POINTS;
  return null;
}

/** What a thrown card's crest is worth, or null when it has none or it doesn't apply. */
export function crestBonus(
  crest: CrestKind | undefined,
  isRight: boolean,
  random: RandomSource,
): CrestBonus | null {
  if (crest === undefined) return null;
  const points = bonusPoints(crest, isRight, random);
  if (points === null) return null;
  const label = translate(`kanji.crestBonus.${crest}`, {
    symbol: CRESTS[crest].symbol,
    points: Math.abs(points),
  });
  return { points, label };
}
