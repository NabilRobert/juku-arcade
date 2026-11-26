/**
 * Each mode's goal for the whole level (D61), shown on its card on the
 * start screen, so there's something to finish beyond a single run:
 * - Words: know every word in the level's deck (correct on two separate
 *   days, leitner.ts, or right in the check-up before first play, so the
 *   goal never starts at zero). Stamps mark each quarter, after the goal-gradient
 *   effect (Kivetz, Urminsky & Zheng 2006): effort rises as a goal nears.
 * - Kanji: master every kanji the level's words use, which takes every
 *   reading found with no wrong pick on two separate days.
 * - Bunpou: rise through the rakugo ranks, 前座 to 二ツ目 to 真打, as the
 *   level's grammar points are learned in the grammar reviews.
 */
import type { DeckWord } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import { createGrammarReviews } from '../grammar/grammar-reviews.ts';
import { CORRECT_DAYS_TO_KNOW } from './leitner.ts';
import type { KanjiRoundRecord } from './play-log.ts';
import { deriveMemory, isWordKnown } from './word-memory.ts';

/** The quarters stamped on the way to a goal, as shares of it. */
export const GOAL_STAMPS = [0.25, 0.5, 0.75, 1] as const;

export interface LevelGoal {
  /** What's counted, as the card says it: "Words known". */
  label: string;
  done: number;
  total: number;
  /** A rank or a title earned along the way, if the goal has one. */
  title?: string;
}

/** The rakugo ranks, each from a share of the level's grammar points learned. */
export const RAKUGO_RANKS = [
  { title: '前座', fromShare: 0 },
  { title: '二ツ目', fromShare: 1 / 3 },
  { title: '真打', fromShare: 1 },
] as const;

export function stampsReached(goal: LevelGoal): number {
  if (goal.total === 0) return 0;
  return GOAL_STAMPS.filter((stamp) => goal.done / goal.total >= stamp).length;
}

export function wordGoal(words: readonly DeckWord[], wordEvents: readonly GameEvent[]): LevelGoal {
  const memory = deriveMemory(wordEvents);
  const known = words.filter((word) => isWordKnown(memory, word.id)).length;
  return { label: 'Words known', done: known, total: words.length };
}

/** Kanji found perfectly on enough separate days to count as mastered. */
export function masteredKanji(rounds: readonly KanjiRoundRecord[]): Set<string> {
  const perfectDays = new Map<string, Set<string>>();
  for (const round of rounds) {
    if (!round.isPerfect) continue;
    const days = perfectDays.get(round.kanji) ?? new Set<string>();
    days.add(round.day);
    perfectDays.set(round.kanji, days);
  }
  const mastered = [...perfectDays].filter(([, days]) => days.size >= CORRECT_DAYS_TO_KNOW);
  return new Set(mastered.map(([kanji]) => kanji));
}

export function kanjiGoal(
  levelKanji: readonly string[],
  rounds: readonly KanjiRoundRecord[],
): LevelGoal {
  const mastered = masteredKanji(rounds);
  const done = levelKanji.filter((kanji) => mastered.has(kanji)).length;
  return { label: 'Kanji mastered', done, total: levelKanji.length };
}

export function rakugoRank(known: number, total: number): string {
  const share = total === 0 ? 0 : known / total;
  let title: string = RAKUGO_RANKS[0].title;
  for (const rank of RAKUGO_RANKS) if (share >= rank.fromShare) title = rank.title;
  return title;
}

export function grammarGoal(
  points: readonly string[],
  grammarEvents: readonly GrammarEvent[],
  today: string,
): LevelGoal {
  const { pointsKnown, pointCount } = createGrammarReviews(points, grammarEvents).progress(today);
  return {
    label: 'Grammar known',
    done: pointsKnown,
    total: pointCount,
    title: rakugoRank(pointsKnown, pointCount),
  };
}
