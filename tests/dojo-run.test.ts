import { describe, expect, it } from 'vitest';
import { afterAnswer, FRESH_DOJO, LANTERNS, secondsFor, stageOf } from '../src/dojo/dojo-run.ts';

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

  it('moves up a stage every 10 right answers, and stays at the fifth', () => {
    expect([0, 9, 10, 25, 39, 40, 400].map(stageOf)).toEqual([1, 1, 2, 3, 4, 5, 5]);
  });

  it('gives each kind of question its own time, never below the fifth stage', () => {
    expect([secondsFor('word', 0), secondsFor('word', 40), secondsFor('word', 999)]).toEqual([
      20, 12, 12,
    ]);
    expect([secondsFor('kanji', 0), secondsFor('kanji', 15)]).toEqual([60, 52]);
    expect([secondsFor('grammar', 0), secondsFor('grammar', 45)]).toEqual([30, 18]);
  });
});
