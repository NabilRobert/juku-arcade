import { describe, expect, it } from 'vitest';
import { bestComparison } from '../src/memory/best-comparison.ts';

describe('a run against the best', () => {
  it('celebrates a new best, saying what it beat', () => {
    expect(bestComparison(25, 20)).toBe('New best! Up from 20.');
  });

  it('says how close a run that fell short came', () => {
    expect(bestComparison(17, 20)).toBe('3 away from your best (20).');
  });

  it('calls a tie a tie', () => {
    expect(bestComparison(20, 20)).toBe('That ties your best (20).');
  });

  it('greets a first scored run, and says nothing for a first run with no score', () => {
    expect(bestComparison(8, 0)).toBe('Your first best: beat it next time!');
    expect(bestComparison(0, 0)).toBe('');
  });
});
