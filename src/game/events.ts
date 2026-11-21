/**
 * The detailed event every action records (requirement R6, decision D26).
 *
 * Events are cheap to capture and can't be recovered later, so every field
 * exists from slice 1. Fields that need later slices are null until then:
 * - `player_id` and `class_code` persist from slice 3 (a fresh ID per visit
 *   until then);
 * - `days_since_last_seen` and `box_before` come from the review engine
 *   (slice 3);
 * - `check_up_role` comes with the check-up (slice 5a).
 * Field names are snake_case because they are the export format (A1).
 */
import type { DecoyType } from '../deck/types.ts';

export const EVENT_SCHEMA_VERSION = 1;

export type EventKind = 'match' | 'miss' | 'timeout' | 'session_start';
export type ErrorType = DecoyType | 'mixUp';
export type Outcome = 'clean' | 'after_miss';

export interface GameEvent {
  event_id: string;
  schema_version: number;
  player_id: string;
  class_code: string | null;
  session_id: string;
  /** Local time with its UTC offset, for example 2026-11-21T20:15:03+07:00. */
  at: string;
  kind: EventKind;
  word_id: string | null;
  first_card: string | null;
  second_card: string | null;
  /** On a miss: was the wrong reading the decoy, or another word's reading? */
  wrong_card_role: 'decoy' | 'word' | null;
  error_type: ErrorType | null;
  ms_since_set_shown: number | null;
  ms_since_last_action: number | null;
  level: number;
  seconds_left: number | null;
  set_index: number;
  cards_left_in_set: number | null;
  outcome: Outcome | null;
  times_seen_before: number | null;
  days_since_last_seen: number | null;
  box_before: number | null;
  tag_shown: number | null;
  check_up_role: 'before' | 'after' | 'held_back' | null;
}

/** Who and when: the same for every event in a session. */
export interface SessionIdentity {
  playerId: string;
  sessionId: string;
}

function localTimeWithOffset(at: Date): string {
  const offsetMinutes = -at.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const pad = (value: number): string => String(Math.floor(Math.abs(value))).padStart(2, '0');
  const local = new Date(at.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 19);
  return `${local}${sign}${pad(offsetMinutes / 60)}:${pad(offsetMinutes % 60)}`;
}

/** An event with every field: the ones given, and null for the rest. */
export function makeEvent(
  identity: SessionIdentity,
  at: Date,
  fields: Pick<GameEvent, 'kind' | 'level' | 'set_index'> & Partial<GameEvent>,
): GameEvent {
  return {
    event_id: crypto.randomUUID(),
    schema_version: EVENT_SCHEMA_VERSION,
    player_id: identity.playerId,
    class_code: null,
    session_id: identity.sessionId,
    at: localTimeWithOffset(at),
    word_id: null,
    first_card: null,
    second_card: null,
    wrong_card_role: null,
    error_type: null,
    ms_since_set_shown: null,
    ms_since_last_action: null,
    seconds_left: null,
    cards_left_in_set: null,
    outcome: null,
    times_seen_before: null,
    days_since_last_seen: null,
    box_before: null,
    tag_shown: null,
    check_up_role: null,
    ...fields,
  };
}
