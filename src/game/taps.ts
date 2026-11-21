/**
 * Tapping cards (L1, L3, L4): select a card, then tap a card of the other
 * kind to pair them. A right pair matches; a wrong pair is a miss.
 *
 * A wrong pair always counts against the word card in it, whichever card
 * was tapped first: tapping じかん then 学校 says "学校 reads じかん", so
 * 学校 is the word missed. The reading's own word did nothing wrong.
 */
import { makeEvent, type GameEvent } from './events.ts';
import { levelAfterMatch, levelAfterMiss } from './levels.ts';
import type { CardRef, RunContext, RunState } from './run.ts';
import { secondsLeft } from './run.ts';
import { scoreSet } from './score.ts';
import { WRONG_FLASH_MS } from './tuning.ts';

interface Pair {
  wordId: string;
  readingIndex: number;
  firstCard: string;
  secondCard: string;
}

function cardText(state: RunState, card: CardRef): string {
  if (card.kind === 'reading') return state.set.readings[card.index]?.text ?? '';
  return state.set.words.find((word) => word.id === card.wordId)?.word ?? '';
}

function isMatched(state: RunState, card: CardRef): boolean {
  const wordId = card.kind === 'word' ? card.wordId : state.set.readings[card.index]?.wordId;
  return wordId !== null && wordId !== undefined && state.matchedWordIds.includes(wordId);
}

function isSameCard(a: CardRef, b: CardRef): boolean {
  if (a.kind === 'word' && b.kind === 'word') return a.wordId === b.wordId;
  return a.kind === 'reading' && b.kind === 'reading' && a.index === b.index;
}

/** The R6 fields every tap event shares. */
function tapEvent(
  state: RunState,
  context: RunContext,
  nowMs: number,
  pair: Pair,
  fields: Partial<GameEvent>,
): GameEvent {
  return makeEvent(context.identity, new Date(nowMs), {
    kind: 'match',
    level: state.level,
    set_index: state.setIndex,
    word_id: pair.wordId,
    first_card: pair.firstCard,
    second_card: pair.secondCard,
    ms_since_set_shown: nowMs - state.setShownAtMs,
    ms_since_last_action: nowMs - state.lastActionAtMs,
    seconds_left: Math.round(secondsLeft(state, nowMs) * 10) / 10,
    cards_left_in_set: state.set.words.length - state.matchedWordIds.length,
    times_seen_before: (state.timesDealt[pair.wordId] ?? 1) - 1,
    tag_shown: context.tags.get(pair.wordId) ?? null,
    ...fields,
  });
}

function withSetEnd(state: RunState, nowMs: number): RunState {
  if (state.matchedWordIds.length < state.set.words.length) return state;
  const score = scoreSet(state.cleanMatchTags, secondsLeft(state, nowMs), state.level);
  return {
    ...state,
    phase: 'cleared',
    lastSetScore: score,
    bestSetScore: Math.max(state.bestSetScore, score.total),
  };
}

function match(state: RunState, context: RunContext, nowMs: number, pair: Pair): RunState {
  const isClean = !state.missedWordIds.includes(pair.wordId);
  const tag = context.tags.get(pair.wordId) ?? 0;
  const combo = state.combo + 1;
  const event = tapEvent(state, context, nowMs, pair, {
    outcome: isClean ? 'clean' : 'after_miss',
  });
  return withSetEnd(
    {
      ...state,
      combo,
      bestCombo: Math.max(state.bestCombo, combo),
      level: levelAfterMatch(state.level, combo),
      matchedWordIds: [...state.matchedWordIds, pair.wordId],
      cleanMatchTags: isClean ? [...state.cleanMatchTags, tag] : state.cleanMatchTags,
      events: [...state.events, event],
    },
    nowMs,
  );
}

function miss(state: RunState, context: RunContext, nowMs: number, pair: Pair): RunState {
  const wrongReading = state.set.readings[pair.readingIndex];
  const isDecoy = wrongReading?.wordId === null;
  const event = tapEvent(state, context, nowMs, pair, {
    kind: 'miss',
    wrong_card_role: isDecoy ? 'decoy' : 'word',
    error_type: isDecoy ? (wrongReading?.decoyType ?? null) : 'mixUp',
  });
  const correctIndex = state.set.readings.findIndex((card) => card.wordId === pair.wordId);
  return {
    ...state,
    combo: 0,
    level: levelAfterMiss(state.level),
    missedWordIds: state.missedWordIds.includes(pair.wordId)
      ? state.missedWordIds
      : [...state.missedWordIds, pair.wordId],
    flash: {
      wordId: pair.wordId,
      correctIndex,
      wrongIndex: pair.readingIndex,
      untilMs: nowMs + WRONG_FLASH_MS,
    },
    events: [...state.events, event],
  };
}

function toPair(state: RunState, first: CardRef, second: CardRef): Pair | null {
  const word = first.kind === 'word' ? first : second;
  const reading = first.kind === 'reading' ? first : second;
  if (word.kind !== 'word' || reading.kind !== 'reading') return null;
  return {
    wordId: word.wordId,
    readingIndex: reading.index,
    firstCard: cardText(state, first),
    secondCard: cardText(state, second),
  };
}

export function tapCard(
  state: RunState,
  context: RunContext,
  card: CardRef,
  nowMs: number,
): RunState {
  if (state.phase !== 'playing' || isMatched(state, card)) return state;
  const selected = state.selected;
  if (selected === null || selected.kind === card.kind) {
    const isUnselect = selected !== null && isSameCard(selected, card);
    return { ...state, selected: isUnselect ? null : card };
  }
  const pair = toPair(state, selected, card);
  if (pair === null) return state;
  const isRight = state.set.readings[pair.readingIndex]?.wordId === pair.wordId;
  const next = isRight ? match(state, context, nowMs, pair) : miss(state, context, nowMs, pair);
  return { ...next, selected: null, lastActionAtMs: nowMs };
}
