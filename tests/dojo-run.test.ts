import { describe, expect, it } from 'vitest';
import { afterAnswer, FRESH_DOJO } from '../src/dojo/dojo-run.ts';
import { LANTERNS } from '../src/game/lanterns.ts';

describe('the dojo', () => {
  it('puts out a lantern for each miss, and ends when the last one goes out', () => {
    let state = FRESH_DOJO;
    for (let miss = 1; miss < LANTERNS; miss += 1) state = afterAnswer(state, false);
    expect(state).toMatchObject({ lanterns: 1, isOver: false });
    state = afterAnswer(afterAnswer(state, true), false);
    expect(state).toMatchObject({ lanterns: 0, right: 1, answered: LANTERNS + 1, isOver: true });
  });

  it('keeps the most right answers in a row, though a miss breaks the combo', () => {
    const answers = [true, true, true, false, true];
    const state = answers.reduce((run, isRight) => afterAnswer(run, isRight), FRESH_DOJO);
    expect([state.combo, state.bestCombo]).toEqual([1, 3]);
  });

  it('ignores answers once the run is over', () => {
    const over = { ...FRESH_DOJO, lanterns: 0, isOver: true };
    expect(afterAnswer(over, true)).toBe(over);
  });
});
