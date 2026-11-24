/**
 * The grammar log's event (D57): one per judged Bunpou sentence, kept in
 * its own table, never in the word log. Word memory reads any answer in
 * the word log as a word answer, so grammar answers there would corrupt
 * it. Like word events, events are cheap to capture and can't be
 * recovered later, so each records more than the reviews need: the
 * template, the answer, the rule a wrong order broke, and the timing.
 * Field names are snake_case to match the word log's export format.
 */
import { localTimeWithOffset, type SessionIdentity } from '../game/events.ts';
import type { BrokenRule } from './broken-rule.ts';

export const GRAMMAR_EVENT_SCHEMA_VERSION = 1;

/** right: built in a right order; wrong: built in a wrong order; timeout: time ran out first. */
export type SentenceOutcome = 'right' | 'wrong' | 'timeout';

export interface GrammarEvent {
  event_id: string;
  schema_version: number;
  player_id: string;
  class_code: string | null;
  session_id: string;
  /** Local time with its UTC offset, like word events. */
  at: string;
  /** The grammar point the sentence tests: the review schedule's key. */
  point_id: string;
  template_id: string;
  outcome: SentenceOutcome;
  /** For a wrong order, the rule it broke first; otherwise null. */
  broken_rule: BrokenRule | null;
  /** The boxes as left, tile texts joined by '|', with '_' for an empty box. */
  answer: string;
  /** How long the player took, from the line shown to the judgement. */
  ms_taken: number;
  level: number;
  combo_before: number;
  /** The point's review box before this answer; null if it was new. */
  box_before: number | null;
}

export type GrammarEventFields = Omit<
  GrammarEvent,
  'event_id' | 'schema_version' | 'player_id' | 'class_code' | 'session_id' | 'at'
>;

export function makeGrammarEvent(
  identity: SessionIdentity,
  at: Date,
  fields: GrammarEventFields,
): GrammarEvent {
  return {
    event_id: crypto.randomUUID(),
    schema_version: GRAMMAR_EVENT_SCHEMA_VERSION,
    player_id: identity.playerId,
    class_code: identity.classCode,
    session_id: identity.sessionId,
    at: localTimeWithOffset(at),
    ...fields,
  };
}

/** The boxes as one string for the log: tiles joined by '|', '_' for an empty box. */
export function answerText(slots: readonly (string | null)[]): string {
  return slots.map((tile) => tile ?? '_').join('|');
}
