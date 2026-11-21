/**
 * The headline measure (phase 3): play effect = after-accuracy minus
 * held-back accuracy, in percentage points, pooled over players, with a 95%
 * bootstrap interval that resamples players (not answers). The success and
 * minimum-data rules are the ones fixed in the plan before any code.
 */
import type { GameEvent } from '../../src/game/events.ts';
import type { CheckRole } from '../../src/memory/check-up.ts';

export const MIN_PLAYERS = 5;
export const MIN_AFTER_ANSWERS = 200;
export const MIN_HELD_BACK_ANSWERS = 100;
/** Play works at +15 points or more with the interval above 0; it doesn't help if the interval is below +5. */
export const SUCCESS_POINTS = 15;
export const NO_HELP_POINTS = 5;
export const RESAMPLES = 10_000;

interface Tally {
  right: number;
  total: number;
}
type PlayerTallies = Record<CheckRole, Tally>;

export type Verdict = 'play_works' | 'play_does_not_help' | 'too_early' | 'not_enough_data';

export interface Measurement {
  verdict: Verdict;
  players: number;
  answers: Record<CheckRole, number>;
  /** Shares correct, 0 to 100; null with no answers. */
  accuracy: Record<CheckRole, number | null>;
  playEffect: number | null;
  interval: [number, number] | null;
}

const emptyTallies = (): PlayerTallies => ({
  before: { right: 0, total: 0 },
  after: { right: 0, total: 0 },
  held_back: { right: 0, total: 0 },
});

function talliesByPlayer(events: readonly GameEvent[]): PlayerTallies[] {
  const byPlayer = new Map<string, PlayerTallies>();
  for (const event of events) {
    const role = event.check_up_role;
    if (role === null || (event.kind !== 'check_up_right' && event.kind !== 'check_up_wrong'))
      continue;
    const tallies = byPlayer.get(event.player_id) ?? emptyTallies();
    tallies[role].total += 1;
    if (event.kind === 'check_up_right') tallies[role].right += 1;
    byPlayer.set(event.player_id, tallies);
  }
  return [...byPlayer.values()];
}

function pooledPercent(players: readonly PlayerTallies[], role: CheckRole): number | null {
  const right = players.reduce((sum, player) => sum + player[role].right, 0);
  const total = players.reduce((sum, player) => sum + player[role].total, 0);
  return total === 0 ? null : (100 * right) / total;
}

function effectOf(players: readonly PlayerTallies[]): number | null {
  const after = pooledPercent(players, 'after');
  const held = pooledPercent(players, 'held_back');
  return after === null || held === null ? null : after - held;
}

function bootstrapInterval(
  players: readonly PlayerTallies[],
  random: () => number,
): [number, number] {
  const effects: number[] = [];
  for (let resample = 0; resample < RESAMPLES; resample++) {
    const sample = players.map(
      () => players[Math.floor(random() * players.length)] ?? emptyTallies(),
    );
    const effect = effectOf(sample);
    if (effect !== null) effects.push(effect);
  }
  effects.sort((a, b) => a - b);
  const at = (share: number): number => effects[Math.floor(share * (effects.length - 1))] ?? 0;
  return [at(0.025), at(0.975)];
}

function verdictOf(effect: number, [low, high]: [number, number]): Verdict {
  if (effect >= SUCCESS_POINTS && low > 0) return 'play_works';
  if (high < NO_HELP_POINTS) return 'play_does_not_help';
  return 'too_early';
}

export function measure(events: readonly GameEvent[], random: () => number): Measurement {
  const players = talliesByPlayer(events);
  const count = (role: CheckRole): number =>
    players.reduce((sum, player) => sum + player[role].total, 0);
  const answers = { before: count('before'), after: count('after'), held_back: count('held_back') };
  const accuracy = {
    before: pooledPercent(players, 'before'),
    after: pooledPercent(players, 'after'),
    held_back: pooledPercent(players, 'held_back'),
  };
  const playEffect = effectOf(players);
  const hasEnough =
    players.length >= MIN_PLAYERS &&
    answers.after >= MIN_AFTER_ANSWERS &&
    answers.held_back >= MIN_HELD_BACK_ANSWERS;
  if (!hasEnough || playEffect === null) {
    return {
      verdict: 'not_enough_data',
      players: players.length,
      answers,
      accuracy,
      playEffect: null,
      interval: null,
    };
  }
  const interval = bootstrapInterval(players, random);
  return {
    verdict: verdictOf(playEffect, interval),
    players: players.length,
    answers,
    accuracy,
    playEffect,
    interval,
  };
}
