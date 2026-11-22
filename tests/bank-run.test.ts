// The bank run: ride the combo for a bigger pot, bank it before a miss takes it.
import { describe, expect, it } from 'vitest';
import {
  addMatch,
  bankPot,
  buyItem,
  coinsForMatch,
  endSet,
  FIRST_TARGET,
  losePot,
  nextRound,
  SETS_PER_ROUND,
  shouldBankAtBell,
  startBankRun,
  targetFor,
  type BankRun,
} from '../src/roguelike/bank-run.ts';

const FIRST = () => 0;

function rideCombo(run: BankRun, length: number): BankRun {
  let ridden = run;
  for (let combo = 1; combo <= length; combo += 1) ridden = addMatch(ridden, combo);
  return ridden;
}

function finishRound(run: BankRun): BankRun {
  let played = run;
  for (let set = 0; set < SETS_PER_ROUND; set += 1) played = endSet(played, FIRST);
  return played;
}

describe('the bank run', () => {
  it('grows the pot faster the longer the combo runs', () => {
    expect(rideCombo(startBankRun(), 3).pot).toBe(1 + 2 + 3);
    expect(rideCombo(startBankRun(), 10).pot).toBe(55);
  });

  it('banks the pot into the wallet and toward the round target', () => {
    const banked = bankPot(rideCombo(startBankRun(), 4));
    expect(banked).toMatchObject({ pot: 0, wallet: 10, bankedThisRound: 10 });
  });

  it('loses the whole pot on a miss', () => {
    const { run, lost } = losePot(rideCombo(startBankRun(), 5));
    expect(run.pot).toBe(0);
    expect(lost).toBe(15);
  });

  it('opens the shop when a round banks its target, and ends the run when it does not', () => {
    const rich = { ...startBankRun(), bankedThisRound: FIRST_TARGET };
    expect(finishRound(rich).offer).not.toBeNull();
    expect(finishRound(startBankRun()).isOver).toBe(true);
  });

  it('banks the pot at the bell only when that reaches a target not yet banked', () => {
    const lastSet = { ...startBankRun(), setsThisRound: SETS_PER_ROUND - 1 };
    expect(shouldBankAtBell({ ...lastSet, bankedThisRound: 20, pot: 15 })).toBe(true);
    expect(shouldBankAtBell({ ...lastSet, bankedThisRound: 5, pot: 15 })).toBe(false);
    expect(shouldBankAtBell({ ...lastSet, bankedThisRound: FIRST_TARGET, pot: 15 })).toBe(false);
    expect(shouldBankAtBell({ ...startBankRun(), bankedThisRound: 20, pot: 15 })).toBe(false);
  });

  it('lets the wallet buy offered items, and starts a harder round with the pot carried over', () => {
    const shop = finishRound({
      ...startBankRun(),
      bankedThisRound: FIRST_TARGET,
      wallet: 30,
      pot: 7,
    });
    const [first] = shop.offer ?? [];
    if (first === undefined) throw new Error('the shop offered nothing');
    const bought = buyItem(shop, first);
    expect(bought.items).toEqual([first]);
    expect(bought.wallet).toBeLessThan(30);
    const next = nextRound(bought);
    expect(next).toMatchObject({ round: 2, target: targetFor(2), bankedThisRound: 0, pot: 7 });
    expect(next.target).toBeGreaterThan(FIRST_TARGET);
  });

  it('will not sell an item the wallet cannot cover', () => {
    const shop = finishRound({ ...startBankRun(), bankedThisRound: FIRST_TARGET, wallet: 0 });
    const [first] = shop.offer ?? [];
    expect(first === undefined ? shop : buyItem(shop, first)).toBe(shop);
  });
});

describe('bank run items', () => {
  const holding = (...items: BankRun['items']): BankRun => ({ ...startBankRun(), items });

  it('omamori keeps half the pot on a miss, and the crane keeps all of it once a round', () => {
    expect(losePot({ ...holding('omamori'), pot: 20 }).run.pot).toBe(10);
    const saved = losePot({ ...holding('tsuru'), pot: 20 });
    expect(saved.lost).toBe(0);
    expect(losePot({ ...saved.run, pot: 20 }).lost).toBe(20);
  });

  it('koi doubles matches from 10 combo, the lucky cat adds a coin, the fan adds 20% on banking', () => {
    expect(coinsForMatch(holding('koi'), 10)).toBe(20);
    expect(coinsForMatch(holding('koi'), 9)).toBe(9);
    expect(coinsForMatch(holding('maneki'), 3)).toBe(4);
    expect(bankPot({ ...holding('sensu'), pot: 10 }).wallet).toBe(12);
  });

  it('bamboo pays interest on the wallet when a round is won', () => {
    const saver = { ...holding('take'), bankedThisRound: FIRST_TARGET, wallet: 20 };
    expect(finishRound(saver).wallet).toBe(24);
  });
});
