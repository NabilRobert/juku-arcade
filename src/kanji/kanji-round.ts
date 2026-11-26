/**
 * One round of kanji mode (D37): a kanji, and a hand of reading cards.
 * Every reading the kanji has in this level's words is right (up to a
 * whole hand of them); the other cards are readings of other kanji. The
 * player picks readings and plays them, as often as they like, until
 * they've found every right one or made three wrong picks (D45). The round
 * is then scored on all the picks: a hit for each right pick, a wrong pick
 * for each other, and a miss for each right reading left in the hand.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import type { Deck } from '../deck/types.ts';
import { allReadingsOf, readingsUsedByKanji, type KanjiReading } from './readings.ts';
import { candidatesOfKind, type KanjiKind, type KanjiStanding } from './sheet-mix.ts';

/** Reading cards in a kanji round's hand. */
export const CARDS_PER_ROUND = 8;
/** Points for each right reading picked, and a bonus for a round with no wrong picks or misses. */
export const POINTS_PER_HIT = 10;
export const PERFECT_ROUND_BONUS = 20;
/** Wrong picks allowed per kanji before the answers show (D45). */
export const MAX_WRONG_PICKS = 3;

export interface KanjiCard {
  text: string;
  isRight: boolean;
}

export interface KanjiRound {
  kanji: string;
  meanings: readonly string[];
  cards: KanjiCard[];
}

export interface RoundResult {
  hits: number;
  wrongPicks: number;
  misses: number;
  isPerfect: boolean;
  points: number;
}

/** The pieces a round is dealt from, worked out once per deck. */
export interface KanjiPool {
  deck: Deck;
  readings: Map<string, KanjiReading[]>;
  /** The kanji on the deck level's official kanji list (D67): what the kanji goal counts. */
  levelList: ReadonlySet<string>;
}

export function kanjiPool(deck: Deck): KanjiPool {
  const readings = readingsUsedByKanji(deck.words);
  for (const kanji of [...readings.keys()]) {
    if (deck.kanji[kanji] === undefined) readings.delete(kanji);
  }
  const onList = [...readings.keys()].filter(
    (kanji) => deck.kanji[kanji]?.listLevel === deck.level,
  );
  return { deck, readings, levelList: new Set(onList) };
}

/** A sheet's wish for a round (sheet-mix.ts): the kind of kanji to draw, and what decides it. */
export interface RoundWish {
  kind: KanjiKind;
  standing: KanjiStanding;
}

/** Readings of other kanji that aren't readings of this one, in random order, one card per reading. */
function decoysFor(pool: KanjiPool, kanji: string, random: RandomSource): KanjiReading[] {
  const note = pool.deck.kanji[kanji];
  const taken = note === undefined ? new Set<string>() : allReadingsOf(note);
  const decoys: KanjiReading[] = [];
  for (const [other, readings] of pool.readings) {
    if (other === kanji) continue;
    for (const reading of readings) {
      if (taken.has(reading.plain)) continue;
      taken.add(reading.plain);
      decoys.push(reading);
    }
  }
  return shuffled(decoys, random);
}

/**
 * Most kanji have one reading in a level's words, so picking evenly makes
 * most rounds "find the one". A kanji is picked in proportion to its
 * readings, counted up to this many, so rounds with several right answers
 * come up often without the few very busy kanji taking over.
 */
const MAX_PICK_WEIGHT = 4;

function pickKanji(
  pool: KanjiPool,
  random: RandomSource,
  recent: readonly string[],
  wish?: RoundWish,
): string {
  const fresh = [...pool.readings.keys()].filter((kanji) => !recent.includes(kanji));
  const wanted = new Set(wish ? candidatesOfKind(fresh, wish.kind, wish.standing) : fresh);
  const choices = [...pool.readings].filter(([kanji]) => wanted.has(kanji));
  const weightOf = (readings: KanjiReading[]): number => Math.min(readings.length, MAX_PICK_WEIGHT);
  const total = choices.reduce((sum, [, readings]) => sum + weightOf(readings), 0);
  let roll = random() * total;
  for (const [kanji, readings] of choices) {
    roll -= weightOf(readings);
    if (roll < 0) return kanji;
  }
  throw new Error("Can't deal a kanji round: this deck has no kanji left to show.");
}

/**
 * Deals a round for a kanji not shown in the last few rounds, of the kind
 * a sheet wishes for if it says (kanji mode); the dojo draws without one.
 */
export function dealKanjiRound(
  pool: KanjiPool,
  random: RandomSource,
  recent: readonly string[],
  wish?: RoundWish,
): KanjiRound {
  const kanji = pickKanji(pool, random, recent, wish);
  const rights = shuffled(pool.readings.get(kanji) ?? [], random).slice(0, CARDS_PER_ROUND);
  const decoys = decoysFor(pool, kanji, random).slice(0, CARDS_PER_ROUND - rights.length);
  const cards = [
    ...rights.map((reading) => ({ text: reading.shown, isRight: true })),
    ...decoys.map((reading) => ({ text: reading.shown, isRight: false })),
  ];
  return {
    kanji,
    meanings: pool.deck.kanji[kanji]?.meanings ?? [],
    cards: shuffled(cards, random),
  };
}

/** How many more wrong picks the player can make on this kanji. */
export function wrongPicksLeft(round: KanjiRound, played: readonly number[]): number {
  const wrongPicks = played.filter((index) => round.cards[index]?.isRight === false).length;
  return Math.max(0, MAX_WRONG_PICKS - wrongPicks);
}

/** A round ends once every right reading is found, or the wrong picks run out. */
export function isRoundOver(round: KanjiRound, played: readonly number[]): boolean {
  const rights = round.cards.filter((card) => card.isRight).length;
  const found = played.filter((index) => round.cards[index]?.isRight === true).length;
  return found === rights || wrongPicksLeft(round, played) === 0;
}

/** Scores the cards the player picked, by their place in the hand. */
export function scoreRound(round: KanjiRound, picked: readonly number[]): RoundResult {
  const hits = picked.filter((index) => round.cards[index]?.isRight === true).length;
  const wrongPicks = picked.length - hits;
  const misses = round.cards.filter((card) => card.isRight).length - hits;
  const isPerfect = wrongPicks === 0 && misses === 0;
  const points = hits * POINTS_PER_HIT + (isPerfect ? PERFECT_ROUND_BONUS : 0);
  return { hits, wrongPicks, misses, isPerfect, points };
}
