// The order checker: units stay whole, the predicate stays last, fixed units keep their place.
import { describe, expect, it } from 'vitest';
import { closestFix, isRightOrder, type OrderRules } from '../src/grammar/order-check.ts';

const wakeUp: OrderRules = {
  units: [['先生', 'は'], ['日曜日', 'に'], ['来ます']],
  fixedUnits: [],
  swaps: [],
};

const tiles = (line: string): string[] => line.split(' ');

describe('the order checker', () => {
  it('takes the template’s own order', () => {
    expect(isRightOrder(tiles('先生 は 日曜日 に 来ます'), wakeUp)).toBe(true);
  });

  it('takes the noun+particle units in either order', () => {
    expect(isRightOrder(tiles('日曜日 に 先生 は 来ます'), wakeUp)).toBe(true);
  });

  it('rejects particles swapped between the nouns', () => {
    expect(isRightOrder(tiles('先生 に 日曜日 は 来ます'), wakeUp)).toBe(false);
  });

  it('rejects a particle before its noun', () => {
    expect(isRightOrder(tiles('は 先生 日曜日 に 来ます'), wakeUp)).toBe(false);
  });

  it('rejects a predicate that isn’t last', () => {
    expect(isRightOrder(tiles('先生 は 来ます 日曜日 に'), wakeUp)).toBe(false);
  });

  it('rejects an answer with a tile missing or used twice', () => {
    expect(isRightOrder(tiles('先生 は 来ます'), wakeUp)).toBe(false);
    expect(isRightOrder(tiles('先生 は 先生 は 来ます'), wakeUp)).toBe(false);
  });

  it('keeps a fixed unit in its place', () => {
    const twist: OrderRules = {
      ...wakeUp,
      units: [['でも、弟', 'も'], ['夜', 'に'], ['来ませんでした']],
      fixedUnits: [0],
    };
    expect(isRightOrder(tiles('でも、弟 も 夜 に 来ませんでした'), twist)).toBe(true);
    expect(isRightOrder(tiles('夜 に でも、弟 も 来ませんでした'), twist)).toBe(false);
  });

  it('takes a particle swap the template lists as also right', () => {
    const goHome: OrderRules = {
      units: [['午後', 'に'], ['学校', 'から'], ['帰りました']],
      fixedUnits: [],
      swaps: [['に', 'から']],
    };
    expect(isRightOrder(tiles('午後 から 学校 に 帰りました'), goHome)).toBe(true);
    expect(isRightOrder(tiles('午後 から 学校 に 帰りました'), { ...goHome, swaps: [] })).toBe(
      false,
    );
  });
});

describe('the fix for a wrong order', () => {
  it('compares with the right order closest to the answer, so a moved unit isn’t marked', () => {
    const fix = closestFix(tiles('日曜日 に 先生 来ます は'), wakeUp);
    expect(fix.order).toEqual(tiles('日曜日 に 先生 は 来ます'));
    expect(fix.wrongAt).toEqual([3, 4]);
  });

  it('marks only what was placed in a line that timed out half built', () => {
    expect(closestFix(tiles('は 先生'), wakeUp)).toEqual({
      order: tiles('先生 は 日曜日 に 来ます'),
      wrongAt: [0, 1],
    });
  });

  it('never marks an empty box as wrong', () => {
    const fix = closestFix(['来ます', null, null, null, null], wakeUp);
    expect(fix.wrongAt).toEqual([0]);
  });
});
