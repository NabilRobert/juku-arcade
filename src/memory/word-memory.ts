/**
 * Each word's memory, derived from the event log (R4): the log is the
 * source of truth, and this state can always be rebuilt from it.
 *
 * Which events count as answers:
 * - a miss or a peek is a wrong answer (L4, L9);
 * - a clean match is a right answer;
 * - matches after a miss or a peek, and timeouts, aren't answers. A timeout
 *   measures reading speed more than memory (D4).
 */
import type { GameEvent } from '../game/events.ts';
import { afterAnswer, NEW_WORD, type LeitnerState } from './leitner.ts';

export interface WordMemory extends LeitnerState {
  attempts: number;
  misses: number;
  firstSeenDay: string;
  lastAnswerDay: string;
  /** The last day this word was answered while due: it counts toward that day's deck (L10). */
  lastDueReviewDay: string | null;
  lastAnswerAt: string;
}

export interface Memory {
  words: Map<string, WordMemory>;
  /** Local days with at least one answer. */
  daysPlayed: Set<string>;
}

export function emptyMemory(): Memory {
  return { words: new Map(), daysPlayed: new Set() };
}

/** The local date of an event: its `at` is local time with an offset, so the first 10 characters. */
export function localDayOf(at: string): string {
  return at.slice(0, 10);
}

function answerOf(event: GameEvent): boolean | null {
  if (event.kind === 'miss' || event.kind === 'peek') return false;
  if (event.kind === 'match' && event.outcome === 'clean') return true;
  return null;
}

function updatedWord(
  previous: WordMemory | undefined,
  isCorrect: boolean,
  event: GameEvent,
): WordMemory {
  const day = localDayOf(event.at);
  const before = previous ?? {
    ...NEW_WORD,
    attempts: 0,
    misses: 0,
    firstSeenDay: day,
    lastDueReviewDay: null,
  };
  const wasDue = before.dueDay !== null && before.dueDay <= day;
  return {
    ...before,
    ...afterAnswer(before, isCorrect, day),
    attempts: before.attempts + 1,
    misses: before.misses + (isCorrect ? 0 : 1),
    lastAnswerDay: day,
    lastDueReviewDay: wasDue ? day : before.lastDueReviewDay,
    lastAnswerAt: event.at,
  };
}

/** Applies one event to the memory, in place. Events must come in time order. */
export function applyEvent(memory: Memory, event: GameEvent): void {
  const isCorrect = answerOf(event);
  if (isCorrect === null || event.word_id === null) return;
  memory.words.set(event.word_id, updatedWord(memory.words.get(event.word_id), isCorrect, event));
  memory.daysPlayed.add(localDayOf(event.at));
}

export function deriveMemory(events: readonly GameEvent[]): Memory {
  const memory = emptyMemory();
  for (const event of events) applyEvent(memory, event);
  return memory;
}
