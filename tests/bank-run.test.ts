// The bank run: flat coins into a pot, bank them before a miss takes them; a shop now and then.
import { describe, expect, it } from 'vitest';
import {
  addMatch,
  bankPot,
  buyItem,
  closeShop,
  COINS_PER_MATCH,
  coinsForMatch,
  endSet,
  losePot,
  openShop,
  SCOUTS_AT_START,
  SHOP_CHANCE,
  startBankRun,
  type BankRun,
} from '../src/bank-run/bank-run.ts';

/** A roll that brings the shop, and one that doesn't. */
const SHOP_ROLL = () => 0;
const NO_SHOP_ROLL = () => SHOP_CHANCE;

function rideCombo(run: BankRun, length: number): BankRun {
  let ridden = run;
  for (let combo = 1; combo <= length; combo += 1) ridden = addMatch(ridden, combo);
  return ridden;
}

/** A run with the shop open and coins to spend. */
function inShop(coins: number): BankRun {
  return openShop(endSet({ ...startBankRun(), coins }, SHOP_ROLL));
}

describe('the bank run', () => {
  it('adds the same coins for every match, however long the combo', () => {
    expect(rideCombo(startBankRun(), 3).pot).toBe(3 * COINS_PER_MATCH);
    expect(coinsForMatch(startBankRun(), 25)).toBe(COINS_PER_MATCH);
  });

  it('banks the pot into your coins, the score', () => {
    expect(bankPot(rideCombo(startBankRun(), 4))).toMatchObject({ pot: 0, coins: 40 });
  });

  it('loses the whole pot on a miss', () => {
    const { run, lost } = losePot(rideCombo(startBankRun(), 5));
    expect(run.pot).toBe(0);
    expect(lost).toBe(50);
  });

  it('never ends: sets go on with no rounds or targets', () => {
    let run = startBankRun();
    for (let set = 0; set < 20; set += 1) run = endSet(run, NO_SHOP_ROLL);
    expect(run).toEqual(startBankRun());
  });
});

describe('the shop', () => {
  it('turns up after a set only on a lucky roll', () => {
    expect(endSet(startBankRun(), SHOP_ROLL).shop).toBe('here');
    expect(endSet(startBankRun(), NO_SHOP_ROLL).shop).toBe('away');
  });

  it('stays for one set, and never comes two sets running', () => {
    const here = endSet(startBankRun(), SHOP_ROLL);
    expect(endSet(here, SHOP_ROLL).shop).toBe('away');
  });

  it('opens only when the player opens it, and is gone once they leave', () => {
    const open = openShop(endSet(startBankRun(), SHOP_ROLL));
    expect(open.shop).toBe('open');
    expect(closeShop(open).shop).toBe('left');
    expect(endSet(closeShop(open), SHOP_ROLL).shop).toBe('away');
  });

  it('tops the scouts back up when it turns up', () => {
    const scouted = { ...startBankRun(), scoutsLeft: 0 };
    expect(endSet(scouted, SHOP_ROLL).scoutsLeft).toBe(SCOUTS_AT_START);
  });

  it('sells an offered item for coins, which lowers the score', () => {
    const shop = inShop(500);
    const [first] = shop.offer;
    if (first === undefined) throw new Error('the shop offered nothing');
    const bought = buyItem(shop, first);
    expect(bought.items).toEqual([first]);
    expect(bought.coins).toBeLessThan(500);
    expect(bought.offer).not.toContain(first);
  });

  it("won't sell what your coins can't cover, or while the shop is closed", () => {
    const poor = inShop(0);
    const [first] = poor.offer;
    if (first === undefined) throw new Error('the shop offered nothing');
    expect(buyItem(poor, first)).toBe(poor);
    const shut = closeShop(inShop(500));
    expect(buyItem(shut, first)).toBe(shut);
  });
});

describe('bank run items', () => {
  const holding = (...items: BankRun['items']): BankRun => ({ ...startBankRun(), items });

  it('omamori keeps half the pot on a miss, and the crane keeps all of it once, then flies off', () => {
    expect(losePot({ ...holding('omamori'), pot: 20 }).run.pot).toBe(10);
    const saved = losePot({ ...holding('tsuru'), pot: 20 });
    expect(saved.lost).toBe(0);
    expect(saved.run.items).toEqual([]);
    expect(losePot({ ...saved.run, pot: 20 }).lost).toBe(20);
  });

  it('koi doubles matches from 10 combo, the lucky cat adds 3 coins, the fan adds 20% on banking', () => {
    expect(coinsForMatch(holding('koi'), 10)).toBe(2 * COINS_PER_MATCH);
    expect(coinsForMatch(holding('koi'), 9)).toBe(COINS_PER_MATCH);
    expect(coinsForMatch(holding('maneki'), 3)).toBe(COINS_PER_MATCH + 3);
    expect(bankPot({ ...holding('sensu'), pot: 10 }).coins).toBe(12);
  });

  it('bamboo pays interest on your coins when the shop turns up', () => {
    expect(endSet({ ...holding('take'), coins: 200 }, SHOP_ROLL).coins).toBe(220);
  });
});
