// Crests on the bank run's cards: a few per set, good ones on words missed before.
import { describe, expect, it } from 'vitest';
import { addMatch, COINS_PER_MATCH, startBankRun, takeCoins } from '../src/bank-run/bank-run.ts';
import { dealCrests, drawOmikuji } from '../src/bank-run/crests.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

const WORDS = ['学校', '先生', '電車', '時間', '友達'].map((word, index) =>
  deckWord(String(index), word, ''),
);

describe('crests on the cards', () => {
  it('marks at most two cards a set', () => {
    const always = () => 0;
    expect(dealCrests(WORDS, new Set(), always).size).toBe(2);
  });

  it('gives words missed before only good crests', () => {
    const missed = new Set(WORDS.map((word) => word.id));
    for (let seed = 1; seed <= 30; seed += 1) {
      const crests = dealCrests(WORDS, missed, seededRandom(seed));
      expect([...crests.values()]).not.toContain('cursed');
    }
  });

  it('pays a koban double, an omikuji a gift, and takes a curse from your banked coins', () => {
    expect(addMatch(startBankRun(), 3, 2).pot).toBe(2 * COINS_PER_MATCH);
    expect(drawOmikuji(() => 0)).toEqual({ to: 'pot', coins: 50 });
    expect(takeCoins({ ...startBankRun(), coins: 3 }, 5).coins).toBe(0);
  });
});
