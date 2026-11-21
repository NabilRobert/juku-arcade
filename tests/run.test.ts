import { describe, expect, it } from 'vitest';
import { dealSet, NO_EXPOSURE } from '../src/game/deal.ts';
import { nextSet, secondsLeft, timeUp, type RunState } from '../src/game/run.ts';
import { tapCard } from '../src/game/taps.ts';
import {
  decoyIndex,
  makeContext,
  otherWordsReadingIndex,
  readingIndexOf,
  start,
  START_MS,
  wordIdAt,
} from './helpers/run.ts';

const LATER = START_MS + 2_000;

/** The field list in requirement R6, which is the export format. */
const R6_FIELDS = [
  'event_id', 'schema_version', 'player_id', 'class_code', 'session_id', 'at', 'kind',
  'word_id', 'first_card', 'second_card', 'wrong_card_role', 'error_type',
  'ms_since_set_shown', 'ms_since_last_action', 'level', 'seconds_left', 'set_index',
  'cards_left_in_set', 'outcome', 'times_seen_before', 'days_since_last_seen', 'box_before',
  'tag_shown', 'check_up_role',
].sort(); // prettier-ignore

function tapPair(
  state: RunState,
  context: ReturnType<typeof makeContext>,
  wordId: string,
  readingIndex: number,
): RunState {
  const selected = tapCard(state, context, { kind: 'word', wordId }, LATER);
  return tapCard(selected, context, { kind: 'reading', index: readingIndex }, LATER);
}

function clearSet(state: RunState, context: ReturnType<typeof makeContext>): RunState {
  let current = state;
  for (const word of state.set.words)
    current = tapPair(current, context, word.id, readingIndexOf(current, word.id));
  return current;
}

describe('a run', () => {
  it('starts at level 1 with combo 0, 5 words, 6 readings and 40 seconds', () => {
    const { state } = start();
    expect([state.level, state.combo, state.set.words.length, state.set.readings.length]).toEqual([
      1, 0, 5, 6,
    ]);
    expect(secondsLeft(state, START_MS)).toBe(40);
  });

  it('matches a right pair and adds 1 to the combo', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const after = tapPair(state, context, word, readingIndexOf(state, word));
    expect(after.matchedWordIds).toEqual([word]);
    expect(after.combo).toBe(1);
  });

  it('matches a right pair tapped reading first', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const selected = tapCard(
      state,
      context,
      { kind: 'reading', index: readingIndexOf(state, word) },
      LATER,
    );
    expect(
      tapCard(selected, context, { kind: 'word', wordId: word }, LATER).matchedWordIds,
    ).toEqual([word]);
  });

  it('unselects a card tapped twice', () => {
    const { state, context } = start();
    const card = { kind: 'word', wordId: wordIdAt(state, 0) } as const;
    expect(tapCard(tapCard(state, context, card, LATER), context, card, LATER).selected).toBeNull();
  });

  it('resets the combo, drops a level and leaves the pair on the board after a wrong pair', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const after = tapPair({ ...state, combo: 7, level: 3 }, context, word, decoyIndex(state));
    expect([after.combo, after.level, after.matchedWordIds.length]).toEqual([0, 2, 0]);
    expect(after.flash?.correctIndex).toBe(readingIndexOf(state, word));
  });

  it('drops from level 5 to level 1 on a wrong pair', () => {
    const { state, context } = start();
    expect(
      tapPair({ ...state, level: 5 }, context, wordIdAt(state, 0), decoyIndex(state)).level,
    ).toBe(1);
  });

  it('goes up a level when a match takes the combo to 10', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    expect(tapPair({ ...state, combo: 9 }, context, word, readingIndexOf(state, word)).level).toBe(
      2,
    );
  });

  it('counts a wrong pair against the word card even when the reading was tapped first', () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const selected = tapCard(
      state,
      context,
      { kind: 'reading', index: otherWordsReadingIndex(state, word) },
      LATER,
    );
    const after = tapCard(selected, context, { kind: 'word', wordId: word }, LATER);
    expect(after.events.at(-1)?.word_id).toBe(word);
  });

  it("logs the decoy's error type when the decoy is picked", () => {
    const { state, context } = start();
    const after = tapPair(state, context, wordIdAt(state, 0), decoyIndex(state));
    const decoy = state.set.readings[decoyIndex(state)];
    expect(after.events.at(-1)).toMatchObject({
      kind: 'miss',
      wrong_card_role: 'decoy',
      error_type: decoy?.decoyType,
    });
  });

  it("logs a mix-up when another word's reading is picked", () => {
    const { state, context } = start();
    const word = wordIdAt(state, 0);
    const after = tapPair(state, context, word, otherWordsReadingIndex(state, word));
    expect(after.events.at(-1)).toMatchObject({
      kind: 'miss',
      wrong_card_role: 'word',
      error_type: 'mixUp',
    });
  });

  it('scores a cleared set with the stacked tags of clean matches only', () => {
    const { state, context } = start();
    const missedWord = wordIdAt(state, 0);
    const cleared = clearSet(tapPair(state, context, missedWord, decoyIndex(state)), context);
    const cleanTags = cleared.set.words
      .filter((word) => word.id !== missedWord)
      .map((word) => context.tags.get(word.id) ?? 0);
    expect(cleared.phase).toBe('cleared');
    expect(cleared.cleanMatchTags).toEqual(cleanTags);
    expect(
      cleared.events.find((event) => event.kind === 'match' && event.word_id === missedWord)
        ?.outcome,
    ).toBe('after_miss');
  });

  it('keeps the best combo and best set score', () => {
    const { state, context } = start();
    const cleared = clearSet(state, context);
    expect(cleared.bestCombo).toBe(5);
    expect(cleared.bestSetScore).toBe(cleared.lastSetScore?.total);
  });

  it('does nothing when the timer still has time left', () => {
    const { state, context } = start();
    expect(timeUp(state, context, START_MS + 39_000)).toBe(state);
  });

  it('logs timeouts, never misses, and resets the combo and level when time runs out', () => {
    const { state, context } = start();
    const after = timeUp({ ...state, combo: 4, level: 2 }, context, START_MS + 40_000);
    expect([after.phase, after.combo, after.level]).toEqual(['timedOut', 0, 1]);
    expect(after.events.filter((event) => event.kind === 'timeout')).toHaveLength(5);
    expect(after.events.some((event) => event.kind === 'miss')).toBe(false);
  });

  it("deals the next set with the new level's time", () => {
    const { state, context } = start();
    const cleared = clearSet({ ...state, level: 2 }, context);
    const next = nextSet(cleared, context, LATER);
    expect([next.phase, next.setIndex, next.setDurationMs]).toEqual(['playing', 1, 30_000]);
  });

  it('records every R6 field on every event', () => {
    const { state, context } = start();
    const after = tapPair(state, context, wordIdAt(state, 0), decoyIndex(state));
    for (const event of after.events) expect(Object.keys(event).sort()).toEqual(R6_FIELDS);
    expect(after.events.at(-1)?.ms_since_set_shown).toBe(2_000);
  });
});

describe('decoy rotation', () => {
  it('uses the least-shown error type the set can supply', () => {
    const { context } = start();
    const exposure = { ...NO_EXPOSURE, longVowel: 9, smallTsu: 9, smallYoon: 9, otherReading: 9 };
    const set = dealSet(context.pool, context.random, exposure);
    expect(set.readings.find((card) => card.wordId === null)?.decoyType).toBe('dakuten');
  });
});

describe('deal events', () => {
  it("logs each set's decoy error type, so reports know how often each type was shown", () => {
    const { state } = start();
    const deal = state.events.find((event) => event.kind === 'deal');
    const decoy = state.set.readings.find((card) => card.wordId === null);
    expect(deal).toMatchObject({ kind: 'deal', error_type: decoy?.decoyType, set_index: 0 });
  });
});
