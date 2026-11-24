// Which rule a wrong order broke, for the grammar log: verb not last, then particle placement, then order.
import { describe, expect, it } from 'vitest';
import { brokenRule } from '../src/grammar/broken-rule.ts';
import type { OrderRules } from '../src/grammar/order-check.ts';

const wakeUp: OrderRules = {
  units: [['先生', 'は'], ['日曜日', 'に'], ['来ます']],
  fixedUnits: [],
  swaps: [],
};
const tiles = (line: string): string[] => line.split(' ');

describe('the broken rule', () => {
  it('names a verb that isn’t last first', () => {
    expect(brokenRule(tiles('先生 は 来ます 日曜日 に'), wakeUp)).toBe('verb_not_last');
  });

  it('names a particle after the wrong word', () => {
    expect(brokenRule(tiles('先生 に 日曜日 は 来ます'), wakeUp)).toBe('particle_after_wrong_word');
  });

  it('names pieces in the wrong order when every particle follows its word', () => {
    const twist: OrderRules = {
      units: [['でも、'], ['先生', 'は'], ['来ます']],
      fixedUnits: [0],
      swaps: [],
    };
    expect(brokenRule(tiles('先生 は でも、 来ます'), twist)).toBe('pieces_out_of_order');
  });

  it('treats particles paired by an allowed swap as attached right', () => {
    const walk: OrderRules = {
      units: [['駅', 'から'], ['学校', 'まで'], ['歩きます']],
      fixedUnits: [],
      swaps: [['から', 'まで']],
    };
    expect(brokenRule(tiles('駅 まで 学校 から 歩きます'), walk)).toBe('pieces_out_of_order');
  });
});
