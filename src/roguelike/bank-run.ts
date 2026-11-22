/**
 * SPIKE: the bank run, Arthur's push-your-luck roguelike. Every match adds
 * coins to an unbanked pot, more the longer the combo runs. Banking moves
 * the pot to your wallet safely but ends the combo; a miss or a timeout
 * loses the pot. A run is rounds of 3 sets, each with a target of coins
 * banked that round; reach it and the shop opens, where your wallet buys
 * items (items.ts); miss it and the run is over. Spending never counts
 * against the target, which only counts what was banked that round.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import { ITEMS, itemById, type ItemId } from './items.ts';

export const SETS_PER_ROUND = 3;
export const FIRST_TARGET = 30;
/** Each round's target is this much bigger than the last. */
const TARGET_GROWTH = 1.6;
export const MAX_ITEMS = 5;
export const OFFER_SIZE = 3;
/** Scouting pauses (they show the crests, specials.ts) allowed each round. */
export const SCOUTS_PER_ROUND = 2;
/** Koi doubles a match's coins from this combo up. */
const KOI_COMBO = 10;
/** The fan's banking bonus, and the bamboo's interest: a coin per this many saved, up to a cap. */
const FAN_BONUS = 0.2;
const BAMBOO_PER_COINS = 5;
const BAMBOO_MAX = 6;

export interface BankRun {
  round: number;
  target: number;
  pot: number;
  wallet: number;
  bankedThisRound: number;
  setsThisRound: number;
  items: ItemId[];
  /** The crane saved a pot this round already. */
  isCraneUsed: boolean;
  /** The shop's items while it's open, else null. */
  offer: ItemId[] | null;
  /** Scouting pauses left this round. */
  scoutsLeft: number;
  isOver: boolean;
}

export function targetFor(round: number): number {
  return Math.round(FIRST_TARGET * TARGET_GROWTH ** (round - 1));
}

export function startBankRun(): BankRun {
  return {
    round: 1,
    target: FIRST_TARGET,
    pot: 0,
    wallet: 0,
    bankedThisRound: 0,
    setsThisRound: 0,
    items: [],
    isCraneUsed: false,
    offer: null,
    isOver: false,
    scoutsLeft: SCOUTS_PER_ROUND,
  };
}

const holds = (run: BankRun, id: ItemId): boolean => run.items.includes(id);

/** Coins a match adds to the pot: its place in the combo, so long combos grow the pot fast. */
export function coinsForMatch(run: BankRun, combo: number): number {
  const base = combo + (holds(run, 'maneki') ? 1 : 0);
  return holds(run, 'koi') && combo >= KOI_COMBO ? base * 2 : base;
}

/** A match adds to the pot; a koban card (specials.ts) doubles what it adds. */
export function addMatch(run: BankRun, combo: number, multiplier = 1): BankRun {
  return { ...run, pot: run.pot + coinsForMatch(run, combo) * multiplier };
}

/** Coins from outside a match (an omikuji's gift), into the pot or the wallet. */
export function addCoins(run: BankRun, to: 'pot' | 'wallet', coins: number): BankRun {
  return to === 'pot' ? { ...run, pot: run.pot + coins } : { ...run, wallet: run.wallet + coins };
}

/** Coins taken from the wallet (a cursed card), never below none. */
export function takeCoins(run: BankRun, coins: number): BankRun {
  return { ...run, wallet: Math.max(0, run.wallet - coins) };
}

export function useScout(run: BankRun): BankRun {
  return run.scoutsLeft > 0 ? { ...run, scoutsLeft: run.scoutsLeft - 1 } : run;
}

/** A miss or a timeout: the pot is lost, unless an item saves some or all of it. */
export function losePot(run: BankRun): { run: BankRun; lost: number } {
  if (holds(run, 'tsuru') && !run.isCraneUsed)
    return { run: { ...run, isCraneUsed: true }, lost: 0 };
  const kept = holds(run, 'omamori') ? Math.floor(run.pot / 2) : 0;
  return { run: { ...run, pot: kept }, lost: run.pot - kept };
}

/** Banks the pot (the caller ends the combo). */
export function bankPot(run: BankRun): BankRun {
  const banked = holds(run, 'sensu') ? Math.ceil(run.pot * (1 + FAN_BONUS)) : run.pot;
  return {
    ...run,
    pot: 0,
    wallet: run.wallet + banked,
    bankedThisRound: run.bankedThisRound + banked,
  };
}

function interest(run: BankRun): number {
  return holds(run, 'take') ? Math.min(Math.floor(run.wallet / BAMBOO_PER_COINS), BAMBOO_MAX) : 0;
}

function shopOffer(run: BankRun, random: RandomSource): ItemId[] {
  const unheld = ITEMS.filter((item) => !holds(run, item.id)).map((item) => item.id);
  return shuffled(unheld, random).slice(0, OFFER_SIZE);
}

/**
 * At the round's last set: whether to bank the pot "at the bell". The
 * last match ends the set at once, so its pot could never be banked in
 * time; when banking it would reach the target, it's banked for the
 * player. A pot that isn't needed (the target is already banked) rides on
 * into the next round, still at risk.
 */
export function shouldBankAtBell(run: BankRun): boolean {
  const isLastSet = run.setsThisRound + 1 >= SETS_PER_ROUND;
  const isShort = run.bankedThisRound < run.target;
  return isLastSet && isShort && run.bankedThisRound + run.pot >= run.target;
}

/** After each set; the last set of a round opens the shop, or ends the run if the target wasn't banked. */
export function endSet(run: BankRun, random: RandomSource): BankRun {
  if (run.offer !== null || run.isOver) return run;
  const played = { ...run, setsThisRound: run.setsThisRound + 1 };
  if (played.setsThisRound < SETS_PER_ROUND) return played;
  if (played.bankedThisRound < played.target) return { ...played, isOver: true };
  return { ...played, wallet: played.wallet + interest(played), offer: shopOffer(played, random) };
}

export function buyItem(run: BankRun, id: ItemId): BankRun {
  const price = itemById(id)?.price ?? Infinity;
  const isOffered = run.offer?.includes(id) === true;
  if (!isOffered || run.wallet < price || run.items.length >= MAX_ITEMS) return run;
  return {
    ...run,
    wallet: run.wallet - price,
    items: [...run.items, id],
    offer: run.offer?.filter((offered) => offered !== id) ?? null,
  };
}

/** Leaves the shop for the next, harder round. The pot carries over. */
export function nextRound(run: BankRun): BankRun {
  const round = run.round + 1;
  return {
    ...run,
    round,
    target: targetFor(round),
    bankedThisRound: 0,
    setsThisRound: 0,
    isCraneUsed: false,
    offer: null,
    scoutsLeft: SCOUTS_PER_ROUND,
  };
}
