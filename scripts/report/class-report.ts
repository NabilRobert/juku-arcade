/**
 * The class report (phase 3's decision report): what to re-teach, which
 * confusions and error types are common, and who may need help. Figures
 * about a word need at least 5 learners, so nobody acts on noise and no
 * single learner can be picked out.
 */
import type { GameEvent } from '../../src/game/events.ts';
import {
  eventsByPlayer,
  isAnswer,
  isRight,
  isWrong,
  pickedReading,
  wordSpellings,
} from './answers.ts';

export const MIN_LEARNERS = 5;
/**
 * A word whose answers are wrong this often is flagged for re-teaching. It's
 * a share of answers, not of learners: over two weeks almost every learner
 * misses almost every word once, so "learners who missed it" flags everything.
 */
export const RETEACH_SHARE = 0.4;
/** An error type missed this many times as often as the others' median is flagged. */
export const ERROR_TYPE_FLAG_RATIO = 2;
export const DAYS_WITHOUT_PLAY_FLAG = 7;
const TOP_WORDS = 10;
const MS_PER_DAY = 86_400_000;

export interface WordRow {
  word: string;
  learnersMet: number;
  answers: number;
  missedAnswers: number;
  /** The share of the class's answers on this word that were wrong. */
  share: number;
  isFlagged: boolean;
}

export interface ConfusionRow {
  word: string;
  picked: string;
  isDecoy: boolean;
  learners: number;
}

export interface ErrorTypeRow {
  errorType: string;
  shown: number;
  missed: number;
  rate: number;
  isFlagged: boolean;
}

function learnersByWord(
  events: readonly GameEvent[],
  test: (event: GameEvent) => boolean,
): Map<string, Set<string>> {
  const result = new Map<string, Set<string>>();
  for (const event of events) {
    if (!isAnswer(event) || !test(event) || event.word_id === null) continue;
    const learners = result.get(event.word_id) ?? new Set<string>();
    learners.add(event.player_id);
    result.set(event.word_id, learners);
  }
  return result;
}

function answerCounts(
  events: readonly GameEvent[],
): Map<string, { answers: number; wrong: number }> {
  const counts = new Map<string, { answers: number; wrong: number }>();
  for (const event of events) {
    if (event.word_id === null || !(isRight(event) || isWrong(event))) continue;
    const count = counts.get(event.word_id) ?? { answers: 0, wrong: 0 };
    count.answers += 1;
    if (isWrong(event)) count.wrong += 1;
    counts.set(event.word_id, count);
  }
  return counts;
}

export function mostMissedWords(events: readonly GameEvent[]): WordRow[] {
  const spellings = wordSpellings(events);
  const met = learnersByWord(events, () => true);
  const counts = answerCounts(events);
  const rows = [...met.entries()]
    .filter(([, learners]) => learners.size >= MIN_LEARNERS)
    .map(([wordId, learners]) => {
      const { answers = 0, wrong = 0 } = counts.get(wordId) ?? {};
      const share = answers === 0 ? 0 : wrong / answers;
      return {
        word: spellings.get(wordId) ?? wordId,
        learnersMet: learners.size,
        answers,
        missedAnswers: wrong,
        share,
        isFlagged: share >= RETEACH_SHARE,
      };
    });
  return rows.sort((a, b) => b.share - a.share).slice(0, TOP_WORDS);
}

/** Wrong picks shared by at least 5 learners; decoys and real mix-ups apart. */
export function commonConfusions(events: readonly GameEvent[]): ConfusionRow[] {
  const spellings = wordSpellings(events);
  const groups = new Map<string, { row: Omit<ConfusionRow, 'learners'>; learners: Set<string> }>();
  for (const event of events) {
    const picked = pickedReading(event);
    if (picked === null || event.word_id === null) continue;
    const key = `${event.word_id}|${picked}`;
    const word = spellings.get(event.word_id) ?? event.word_id;
    const group = groups.get(key) ?? {
      row: { word, picked, isDecoy: event.wrong_card_role === 'decoy' },
      learners: new Set<string>(),
    };
    group.learners.add(event.player_id);
    groups.set(key, group);
  }
  return [...groups.values()]
    .filter((group) => group.learners.size >= MIN_LEARNERS)
    .map((group) => ({ ...group.row, learners: group.learners.size }))
    .sort((a, b) => b.learners - a.learners);
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/** Misses per time shown for each error type; empty if no deal events say what was shown. */
export function errorTypeRates(events: readonly GameEvent[]): ErrorTypeRow[] {
  const shown = new Map<string, number>();
  const missed = new Map<string, number>();
  for (const event of events) {
    if (event.kind === 'deal' && event.error_type)
      shown.set(event.error_type, (shown.get(event.error_type) ?? 0) + 1);
    if (event.kind === 'miss' && event.wrong_card_role === 'decoy' && event.error_type) {
      missed.set(event.error_type, (missed.get(event.error_type) ?? 0) + 1);
    }
  }
  const rows = [...shown.entries()].map(([errorType, count]) => {
    const misses = missed.get(errorType) ?? 0;
    return { errorType, shown: count, missed: misses, rate: misses / count, isFlagged: false };
  });
  return rows.map((row) => {
    const others = median(rows.filter((other) => other !== row).map((other) => other.rate));
    return { ...row, isFlagged: others > 0 && row.rate >= ERROR_TYPE_FLAG_RATIO * others };
  });
}

export interface HelpRow {
  playerId: string;
  daysSinceLastPlay: number;
  weeklyAccuracy: number[];
  reason: string;
}

function weeklyAccuracy(events: readonly GameEvent[], now: Date): number[] {
  const weeks = new Map<number, { right: number; total: number }>();
  for (const event of events.filter((candidate) => isRight(candidate) || isWrong(candidate))) {
    const weeksAgo = Math.floor((now.getTime() - Date.parse(event.at)) / (7 * MS_PER_DAY));
    const tally = weeks.get(weeksAgo) ?? { right: 0, total: 0 };
    tally.total += 1;
    if (isRight(event)) tally.right += 1;
    weeks.set(weeksAgo, tally);
  }
  return [2, 1, 0].flatMap((weeksAgo) => {
    const tally = weeks.get(weeksAgo);
    return tally ? [tally.right / tally.total] : [];
  });
}

/** Learners to check on: no play for 7 days, or accuracy falling 2 weeks running. */
export function learnersNeedingHelp(events: readonly GameEvent[], now: Date): HelpRow[] {
  const byPlayer = eventsByPlayer(events);
  const rows: HelpRow[] = [];
  for (const [playerId, playerEvents] of byPlayer) {
    const lastAt = Math.max(...playerEvents.map((event) => Date.parse(event.at)));
    const daysSinceLastPlay = Math.floor((now.getTime() - lastAt) / MS_PER_DAY);
    const weekly = weeklyAccuracy(playerEvents, now);
    const [first = 0, second = 0, third = 0] = weekly;
    const isFalling = weekly.length === 3 && first > second && second > third;
    if (daysSinceLastPlay >= DAYS_WITHOUT_PLAY_FLAG)
      rows.push({
        playerId,
        daysSinceLastPlay,
        weeklyAccuracy: weekly,
        reason: `no play for ${daysSinceLastPlay} days`,
      });
    else if (isFalling)
      rows.push({
        playerId,
        daysSinceLastPlay,
        weeklyAccuracy: weekly,
        reason: 'accuracy falling 2 weeks running',
      });
  }
  return rows;
}
