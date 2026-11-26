/**
 * The bank run (D44, D46): word mode's endless push-your-luck run. Every
 * match adds the same coins to an unbanked pot. Banking moves the pot to
 * your coins, which are your score, and ends the combo; a miss or a
 * timeout loses the pot. There are no rounds and no game over.
 *
 * Now and then a shop turns up for one set (SHOP_CHANCE). Its button
 * shows in the side panel; open it and your coins buy items (items.ts)
 * that earn more, so buying lowers your score now for a bigger one later.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import { ITEMS, itemById, type ItemId } from './items.ts';

/** Coins every match adds to the pot, whatever the combo (no multiplier, D46). */
export const COINS_PER_MATCH = 10;
export const MAX_ITEMS = 5;
export const OFFER_SIZE = 3;
/** The chance, after a set, that the shop turns up for the next one. It never comes two sets running. */
export const SHOP_CHANCE = 1 / 3;
/** Scouting pauses (they show the crests, crests.ts) a run starts with; the shop tops them back up. */
export const SCOUTS_AT_START = 2;
/** The lucky cat's extra coins per match, and the combo from which koi doubles a match's coins. */
const MANEKI_BONUS = 3;
const KOI_COMBO = 10;
/** The fan's banking bonus, and the bamboo's interest: a coin per this many saved, up to a cap. */
const FAN_BONUS = 0.2;
const BAMBOO_PER_COINS = 10;
const BAMBOO_MAX = 50;

/**
 * Where the shop is: away; here for this set (its button shows); open; or
 * left, once visited, until the set ends.
 */
export type ShopState = 'away' | 'here' | 'open' | 'left';

export interface BankRun {
  /** Coins won since the last bank: lost on a miss or a timeout. */
  pot: number;
  /** Banked coins: the score, and what the shop takes. */
  coins: number;
  items: ItemId[];
  shop: ShopState;
  /** The items the shop has, while it's here. */
  offer: ItemId[];
  scoutsLeft: number;
}

export function startBankRun(): BankRun {
  return { pot: 0, coins: 0, items: [], shop: 'away', offer: [], scoutsLeft: SCOUTS_AT_START };
}

const holds = (run: BankRun, id: ItemId): boolean => run.items.includes(id);

/** Coins a match adds to the pot: the same each time, plus what items add. */
export function coinsForMatch(run: BankRun, combo: number): number {
  const base = COINS_PER_MATCH + (holds(run, 'maneki') ? MANEKI_BONUS : 0);
  return holds(run, 'koi') && combo >= KOI_COMBO ? base * 2 : base;
}

/** A match adds to the pot; a koban card (crests.ts) doubles what it adds. */
export function addMatch(run: BankRun, combo: number, multiplier = 1): BankRun {
  return { ...run, pot: run.pot + coinsForMatch(run, combo) * multiplier };
}

/** Coins from outside a match (an omikuji's gift), into the pot or straight into your coins. */
export function addCoins(run: BankRun, to: 'pot' | 'coins', coins: number): BankRun {
  return to === 'pot' ? { ...run, pot: run.pot + coins } : { ...run, coins: run.coins + coins };
}

/** Coins taken from your banked coins (a cursed card), never below none. */
export function takeCoins(run: BankRun, coins: number): BankRun {
  return { ...run, coins: Math.max(0, run.coins - coins) };
}

/** Spends one scout, if any are left. */
export function spendScout(run: BankRun): BankRun {
  return run.scoutsLeft > 0 ? { ...run, scoutsLeft: run.scoutsLeft - 1 } : run;
}

/** A miss or a timeout: the pot is lost, unless an item saves some or all of it. */
export function losePot(run: BankRun): { run: BankRun; lost: number } {
  if (holds(run, 'tsuru')) {
    // The crane saves one pot, then flies off.
    return { run: { ...run, items: run.items.filter((id) => id !== 'tsuru') }, lost: 0 };
  }
  const kept = holds(run, 'omamori') ? Math.floor(run.pot / 2) : 0;
  return { run: { ...run, pot: kept }, lost: run.pot - kept };
}

/** Banks the pot into your coins (the caller ends the combo). */
export function bankPot(run: BankRun): BankRun {
  const banked = holds(run, 'sensu') ? Math.ceil(run.pot * (1 + FAN_BONUS)) : run.pot;
  return { ...run, pot: 0, coins: run.coins + banked };
}

function interest(run: BankRun): number {
  return holds(run, 'take') ? Math.min(Math.floor(run.coins / BAMBOO_PER_COINS), BAMBOO_MAX) : 0;
}

function shopOffer(run: BankRun, random: RandomSource): ItemId[] {
  const unheld = ITEMS.filter((item) => !holds(run, item.id)).map((item) => item.id);
  return shuffled(unheld, random).slice(0, OFFER_SIZE);
}

/**
 * After each set: a shop that was here leaves, and otherwise one may turn
 * up for the next set. When it does, the bamboo pays interest and your
 * scouts are topped back up.
 */
export function endSet(run: BankRun, random: RandomSource): BankRun {
  if (run.shop !== 'away') return { ...run, shop: 'away', offer: [] };
  if (random() >= SHOP_CHANCE) return run;
  return {
    ...run,
    shop: 'here',
    offer: shopOffer(run, random),
    coins: run.coins + interest(run),
    scoutsLeft: Math.max(run.scoutsLeft, SCOUTS_AT_START),
  };
}

export function openShop(run: BankRun): BankRun {
  return run.shop === 'here' ? { ...run, shop: 'open' } : run;
}

/** Leaving the shop: it's gone until a later set brings it back. */
export function closeShop(run: BankRun): BankRun {
  return run.shop === 'open' ? { ...run, shop: 'left' } : run;
}

export function buyItem(run: BankRun, id: ItemId): BankRun {
  const price = itemById(id)?.price ?? Infinity;
  const canBuy = run.shop === 'open' && run.offer.includes(id) && run.items.length < MAX_ITEMS;
  if (!canBuy || run.coins < price) return run;
  return {
    ...run,
    coins: run.coins - price,
    items: [...run.items, id],
    offer: run.offer.filter((offered) => offered !== id),
  };
}
