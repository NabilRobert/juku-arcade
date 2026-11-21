// Simulated players for the report script's tests and power check (phase 3:
// "checking the pipeline before real data"). Each emits events in the real format, with a
// known chance of recall, so the reports can be checked against the truth.
import type { DecoyType } from '../../src/deck/types.ts';
import { makeEvent, type GameEvent, type SessionIdentity } from '../../src/game/events.ts';
import { seededRandom } from '../../src/game/random.ts';
import type { CheckRole } from '../../src/memory/check-up.ts';
import type { ExportFile } from '../../src/memory/export.ts';

export interface Plan {
  players: number;
  days: number;
  /** Chance of a right check-up answer, by role: the planted truth. */
  recall: Record<CheckRole, number>;
  seed: number;
  /** A word most players miss (for the class report). */
  weakWordMissChance?: number;
  /** An error type players fall for more often than the others. */
  hardType?: { type: DecoyType; missChance: number };
}

const DAY_MS = 86_400_000;
const START = Date.parse('2026-11-01T10:00:00+07:00');
const ROLES: [CheckRole, number][] = [
  ['before', 2],
  ['after', 2],
  ['held_back', 1],
];
const TYPES: DecoyType[] = ['longVowel', 'smallTsu', 'dakuten', 'smallYoon', 'otherReading'];
const OTHER_MISS_CHANCE = 0.1;

function at(day: number, minute: number): string {
  const date = new Date(START + day * DAY_MS + minute * 60_000);
  return `${date.toISOString().slice(0, 19)}+07:00`;
}

function checkUps(
  identity: SessionIdentity,
  day: number,
  plan: Plan,
  random: () => number,
): GameEvent[] {
  return ROLES.flatMap(([role, count]) =>
    Array.from({ length: count }, (_, index) =>
      makeEvent(identity, new Date(), {
        kind: random() < plan.recall[role] ? 'check_up_right' : 'check_up_wrong',
        check_up_role: role,
        word_id: `c${day}-${role}-${index}`,
        at: at(day, index),
        level: 0,
        set_index: 0,
      }),
    ),
  );
}

function wordAnswer(
  identity: SessionIdentity,
  day: number,
  wordId: string,
  missChance: number,
  random: () => number,
): GameEvent {
  const isMiss = random() < missChance;
  return makeEvent(identity, new Date(), {
    kind: isMiss ? 'miss' : 'match',
    outcome: isMiss ? null : 'clean',
    word_id: wordId,
    first_card: `語${wordId}`,
    second_card: isMiss ? `ご${wordId}x` : `ご${wordId}`,
    wrong_card_role: isMiss ? 'word' : null,
    error_type: isMiss ? 'mixUp' : null,
    at: at(day, 20),
    level: 1,
    set_index: 0,
  });
}

function decoySets(
  identity: SessionIdentity,
  day: number,
  plan: Plan,
  random: () => number,
): GameEvent[] {
  return TYPES.flatMap((type) => {
    const missChance = plan.hardType?.type === type ? plan.hardType.missChance : OTHER_MISS_CHANCE;
    const deal = makeEvent(identity, new Date(), {
      kind: 'deal',
      error_type: type,
      at: at(day, 30),
      level: 1,
      set_index: 0,
    });
    if (random() >= missChance) return [deal];
    const miss = makeEvent(identity, new Date(), {
      kind: 'miss',
      word_id: 'd1',
      first_card: '語d1',
      second_card: `decoy-${type}`,
      wrong_card_role: 'decoy',
      error_type: type,
      at: at(day, 31),
      level: 1,
      set_index: 0,
    });
    return [deal, miss];
  });
}

function playerEvents(player: number, plan: Plan, random: () => number): GameEvent[] {
  const identity = {
    playerId: `player-${String(player).padStart(4, '0')}-sim`,
    sessionId: `s${player}`,
    classCode: 'SIM',
  };
  return Array.from({ length: plan.days }, (_, day) => [
    ...checkUps(identity, day, plan, random),
    wordAnswer(identity, day, 'weak', plan.weakWordMissChance ?? OTHER_MISS_CHANCE, random),
    wordAnswer(identity, day, 'easy', OTHER_MISS_CHANCE, random),
    ...decoySets(identity, day, plan, random),
  ]).flat();
}

export function simulateExports(plan: Plan): ExportFile[] {
  const random = seededRandom(plan.seed);
  return Array.from({ length: plan.players }, (_, player) => {
    const events = playerEvents(player, plan, random);
    const first = events[0];
    return {
      format_version: 1,
      exported_at: at(plan.days, 0),
      player_id: first?.player_id ?? '',
      class_code: 'SIM',
      level: 'N5',
      event_count: events.length,
      events,
    };
  });
}
