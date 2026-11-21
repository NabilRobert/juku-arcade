/**
 * The game measures S1, S4, S5 and S6 (phase 3), read from events alone:
 * whether players come back, whether the loop is balanced, whether pause
 * and flip helps, and whether the check-up is taken often enough for the
 * headline. S2 and S3 also need the decks; they live in deck-measures.ts.
 *
 * A "play day" is a day with at least one dealt set, so a day with only a
 * check-up doesn't count as playing.
 */
import type { GameEvent } from '../../src/game/events.ts';
import { MAX_LEVEL } from '../../src/game/tuning.ts';
import { isCheckUpEvent } from '../../src/memory/check-up.ts';
import { addDays } from '../../src/memory/leitner.ts';
import { localDayOf } from '../../src/memory/word-memory.ts';
import { eventsByPlayer, groupEvents, isRight, isWrong } from './answers.ts';

/** S1: the window "days played out of the first 14" looks at. */
export const FIRST_DAYS = 14;
/** S4: leaving within this many sets of a drop from level 5 to 1 counts as quitting. */
export const QUIT_WITHIN_SETS = 2;

/** A count out of a total; the share is count / total. */
export interface Share {
  count: number;
  total: number;
}

export interface ComingBack {
  players: number;
  /** Players whose first 14 days have passed, and their average days played in them. */
  playersPastFirst14: number;
  averageDaysOfFirst14: number | null;
  backOnDay2: Share;
  backOnDay7: Share;
}

export interface LevelRow {
  level: number;
  sets: number;
  timedOutSets: number;
  misses: number;
}

export interface LoopBalance {
  levels: LevelRow[];
  /** Misses at level 5, each of which sends the player back to level 1. */
  dropsFromTop: Share;
  quitsAfterDrop: number;
}

export interface PeekMeasure {
  peeks: number;
  sets: number;
  /** The next answer in a later set, for words peeked at, and for words only missed. */
  peekedThenRight: Share;
  missedThenRight: Share;
}

const isDeal = (event: GameEvent): boolean => event.kind === 'deal';

function playDays(events: readonly GameEvent[]): Set<string> {
  return new Set(events.filter(isDeal).map((event) => localDayOf(event.at)));
}

/** The last day anyone's data covers: a player's day 7 only counts once it has passed. */
function lastDataDay(events: readonly GameEvent[]): string {
  return events.reduce((latest, event) => {
    const day = localDayOf(event.at);
    return day > latest ? day : latest;
  }, '');
}

export function comingBack(events: readonly GameEvent[]): ComingBack {
  const lastDay = lastDataDay(events);
  const result: ComingBack = {
    players: 0,
    playersPastFirst14: 0,
    averageDaysOfFirst14: null,
    backOnDay2: { count: 0, total: 0 },
    backOnDay7: { count: 0, total: 0 },
  };
  let daysOfFirst14 = 0;
  for (const playerEvents of eventsByPlayer(events).values()) {
    const days = [...playDays(playerEvents)].sort();
    const first = days[0];
    if (first === undefined) continue;
    result.players += 1;
    countReturn(result.backOnDay2, days, addDays(first, 1), lastDay);
    countReturn(result.backOnDay7, days, addDays(first, 6), lastDay);
    const windowEnd = addDays(first, FIRST_DAYS - 1);
    if (windowEnd > lastDay) continue;
    result.playersPastFirst14 += 1;
    daysOfFirst14 += days.filter((day) => day <= windowEnd).length;
  }
  if (result.playersPastFirst14 > 0) {
    result.averageDaysOfFirst14 = daysOfFirst14 / result.playersPastFirst14;
  }
  return result;
}

function countReturn(share: Share, days: readonly string[], day: string, lastDay: string): void {
  if (day > lastDay) return;
  share.total += 1;
  if (days.includes(day)) share.count += 1;
}

function levelRows(events: readonly GameEvent[]): LevelRow[] {
  const rows = Array.from({ length: MAX_LEVEL }, (_, index) => ({
    level: index + 1,
    sets: 0,
    timedOutSets: new Set<string>(),
    misses: 0,
  }));
  for (const event of events) {
    const row = rows[event.level - 1];
    if (row === undefined) continue;
    if (isDeal(event)) row.sets += 1;
    if (event.kind === 'miss') row.misses += 1;
    // A timed-out set logs one timeout per unmatched word; count the set once.
    if (event.kind === 'timeout') row.timedOutSets.add(`${event.session_id}:${event.set_index}`);
  }
  return rows.map((row) => ({ ...row, timedOutSets: row.timedOutSets.size }));
}

/** S4: a miss at level 5 drops to level 1 (D3); did the player leave soon after? */
export function loopBalance(events: readonly GameEvent[]): LoopBalance {
  const levels = levelRows(events);
  const topLevelMisses = levels[MAX_LEVEL - 1]?.misses ?? 0;
  let quitsAfterDrop = 0;
  for (const sessionEvents of groupEvents(events, (event) => event.session_id).values()) {
    sessionEvents.forEach((event, index) => {
      if (event.kind !== 'miss' || event.level !== MAX_LEVEL) return;
      const setsAfter = sessionEvents.slice(index + 1).filter(isDeal).length;
      if (setsAfter <= QUIT_WITHIN_SETS) quitsAfterDrop += 1;
    });
  }
  const topSets = levels[MAX_LEVEL - 1]?.sets ?? 0;
  return { levels, dropsFromTop: { count: topLevelMisses, total: topSets }, quitsAfterDrop };
}

interface Pending {
  kind: 'peek' | 'miss';
  setNumber: number;
}

interface LaterAnswers {
  peeked: Share;
  missed: Share;
}

/** Scores a word's next answer in a later set against the peek or miss waiting on it. */
function resolvePending(
  pending: Map<string, Pending>,
  wordId: string,
  event: GameEvent,
  setNumber: number,
  results: LaterAnswers,
): void {
  const waiting = pending.get(wordId);
  if (waiting === undefined || waiting.setNumber === setNumber) return;
  const share = waiting.kind === 'peek' ? results.peeked : results.missed;
  share.total += 1;
  if (isRight(event)) share.count += 1;
  pending.delete(wordId);
}

/** Starts waiting on a peeked or missed word; a peek outranks a miss in the same set. */
function recordPending(
  pending: Map<string, Pending>,
  wordId: string,
  event: GameEvent,
  setNumber: number,
): void {
  if (event.kind !== 'peek' && event.kind !== 'miss') return;
  if (pending.get(wordId)?.kind === 'peek') return;
  pending.set(wordId, { kind: event.kind, setNumber });
}

/** S5: for one player, the next answer in a later set after each peek or miss. */
function laterAnswers(events: readonly GameEvent[], results: LaterAnswers): void {
  const pending = new Map<string, Pending>();
  let setNumber = 0;
  for (const event of events) {
    if (isDeal(event)) setNumber += 1;
    if (event.word_id === null || !(isRight(event) || isWrong(event))) continue;
    resolvePending(pending, event.word_id, event, setNumber, results);
    recordPending(pending, event.word_id, event, setNumber);
  }
}

export function peekMeasure(events: readonly GameEvent[]): PeekMeasure {
  const peekedThenRight: Share = { count: 0, total: 0 };
  const missedThenRight: Share = { count: 0, total: 0 };
  for (const playerEvents of eventsByPlayer(events).values()) {
    laterAnswers(playerEvents, { peeked: peekedThenRight, missed: missedThenRight });
  }
  return {
    peeks: events.filter((event) => event.kind === 'peek').length,
    sets: events.filter(isDeal).length,
    peekedThenRight,
    missedThenRight,
  };
}

/** S6: the share of play days on which the player also took the check-up. */
export function checkUpUptake(events: readonly GameEvent[]): Share {
  const uptake: Share = { count: 0, total: 0 };
  for (const playerEvents of eventsByPlayer(events).values()) {
    const checkUpDays = new Set(
      playerEvents.filter(isCheckUpEvent).map((event) => localDayOf(event.at)),
    );
    for (const day of playDays(playerEvents)) {
      uptake.total += 1;
      if (checkUpDays.has(day)) uptake.count += 1;
    }
  }
  return uptake;
}
