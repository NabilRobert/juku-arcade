/**
 * The optional daily check-up (C1–C5), which is also the headline measure
 * (phase 3): each word is checked once before its first play (before), and
 * again later, either after play (after) or after being held back from
 * play for 3 days (held back). After minus held back is what play adds.
 *
 * Which words are held back is decided by a hash of the player and word
 * IDs: random-like, the same every time, and recoverable from an export
 * without storing anything extra. Check-up answers never change the review
 * schedule or difficulty (C4): word-memory.ts ignores them.
 */
import type { DeckWord } from '../deck/types.ts';
import type { RandomSource } from '../game/deal.ts';
import { shuffled } from '../game/deal.ts';
import { makeEvent, type GameEvent, type SessionIdentity } from '../game/events.ts';
import { addDays, localDayOf } from './days.ts';

/** C2: questions per check-up, by role. */
export const QUESTIONS_PER_ROLE = { before: 2, after: 2, held_back: 1 } as const;
/** C1: options per question, and seconds to answer. */
export const OPTIONS_PER_QUESTION = 4;
export const SECONDS_PER_QUESTION = 8;
/** C2: 1 in this many checked words is held back from play, for this many days. */
export const HELD_BACK_ONE_IN = 3;
export const HOLD_DAYS = 3;

export type CheckRole = keyof typeof QUESTIONS_PER_ROLE;

/** One word's check-up history. */
export interface CheckRecord {
  beforeDay: string;
  /** The day a held-back word may enter play; null if it wasn't held back. */
  heldUntilDay: string | null;
  isAfterDone: boolean;
  isHeldBackDone: boolean;
}

export interface Question {
  word: DeckWord;
  role: CheckRole;
  options: string[];
}

/** FNV-1a: a tiny, stable string hash; enough to split words into groups. */
function hash(text: string): number {
  let value = 0x811c9dc5;
  for (const char of text) value = Math.imul(value ^ (char.codePointAt(0) ?? 0), 0x01000193);
  return value >>> 0;
}

export function isHeldBack(playerId: string, wordId: string): boolean {
  return hash(`${playerId}:${wordId}`) % HELD_BACK_ONE_IN === 0;
}

export function isCheckUpEvent(event: GameEvent): boolean {
  return event.kind === 'check_up_right' || event.kind === 'check_up_wrong';
}

/** Updates a word's check-up history with one check-up answer, in place. */
export function applyCheckUp(records: Map<string, CheckRecord>, event: GameEvent): void {
  if (!isCheckUpEvent(event) || event.word_id === null) return;
  const day = localDayOf(event.at);
  const existing = records.get(event.word_id);
  if (event.check_up_role === 'before' && existing === undefined) {
    const held = isHeldBack(event.player_id, event.word_id);
    records.set(event.word_id, {
      beforeDay: day,
      heldUntilDay: held ? addDays(day, HOLD_DAYS) : null,
      isAfterDone: false,
      isHeldBackDone: false,
    });
    return;
  }
  if (existing === undefined) return;
  if (event.check_up_role === 'after') existing.isAfterDone = true;
  if (event.check_up_role === 'held_back') existing.isHeldBackDone = true;
}

/** True while a held-back word must stay out of play. */
export function isOnHold(
  records: ReadonlyMap<string, CheckRecord>,
  wordId: string,
  today: string,
): boolean {
  const heldUntil = records.get(wordId)?.heldUntilDay ?? null;
  return heldUntil !== null && today < heldUntil;
}

/**
 * Three wrong readings from other words in the deck (C5), preferring the
 * same length and first kana, so the right one doesn't stand out. Chosen
 * apart from the game's decoys, so the check-up doesn't reward having
 * learned those.
 */
export function optionsFor(
  word: DeckWord,
  deck: readonly DeckWord[],
  random: RandomSource,
): string[] {
  const similarity = (reading: string): number =>
    (reading.length === word.reading.length ? 2 : 0) + (reading[0] === word.reading[0] ? 1 : 0);
  const blocked = new Set([word.reading, ...word.otherReadings]);
  const candidates = [...new Set(deck.map((other) => other.reading))].filter(
    (reading) => !blocked.has(reading),
  );
  const ranked = shuffled(candidates, random).sort((a, b) => similarity(b) - similarity(a));
  return shuffled([word.reading, ...ranked.slice(0, OPTIONS_PER_QUESTION - 1)], random);
}

/** The event for one check-up answer; a timeout is a wrong answer with no reading chosen (C1). */
export function checkUpEvent(
  identity: SessionIdentity,
  question: Question,
  chosen: string | null,
  msTaken: number,
  at: Date,
): GameEvent {
  const isRight = chosen === question.word.reading;
  return makeEvent(identity, at, {
    kind: isRight ? 'check_up_right' : 'check_up_wrong',
    check_up_role: question.role,
    // The check-up isn't played at a level; 0 marks "not in a run".
    level: 0,
    set_index: 0,
    word_id: question.word.id,
    first_card: question.word.word,
    second_card: chosen,
    ms_since_set_shown: msTaken,
    seconds_left: Math.max(0, Math.round((SECONDS_PER_QUESTION - msTaken / 1000) * 10) / 10),
  });
}
