/**
 * What the play calendar shows for one day: how many runs and minutes,
 * each mode's best score that day beside its best that month and ever,
 * the words and grammar answered, new words met, the haiku Bunpou shows
 * closed on, and the most recognised and most missed kanji
 * (kanji-tally.ts). Worked out in the browser from
 * the play log and the event logs; nothing is sent anywhere.
 */
import type { GameEvent } from '../game/events.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import { kanjiOfDay, type KanjiDay } from './kanji-tally.ts';
import type { KanjiRoundRecord, PlayMode, PlayedRun } from './play-log.ts';
import { localDayOf } from './word-memory.ts';

const MS_PER_MINUTE = 60_000;
const MODES: readonly PlayMode[] = ['words', 'kanji', 'bunpou'];

export interface PlayHistory {
  runs: readonly PlayedRun[];
  kanjiRounds: readonly KanjiRoundRecord[];
  wordEvents: readonly GameEvent[];
  grammarEvents: readonly GrammarEvent[];
  /** Each word's text, by id, to find its kanji. */
  wordTextById: ReadonlyMap<string, string>;
}

export interface ModeScores {
  mode: PlayMode;
  dayBest: number;
  monthBest: number;
  everBest: number;
}

export interface Answers {
  answered: number;
  right: number;
}

export interface DaySummary {
  runs: number;
  minutes: number;
  /** Only the modes played that day. */
  scores: ModeScores[];
  words: Answers;
  grammar: Answers;
  newWords: number;
  grammarPoints: number;
  /** The haiku that day's Bunpou shows closed on, by id, oldest first. */
  haikuIds: string[];
  kanji: KanjiDay;
}

const bestScore = (runs: readonly PlayedRun[]): number =>
  runs.reduce((best, run) => Math.max(best, run.score), 0);

function scoresOn(day: string, runs: readonly PlayedRun[]): ModeScores[] {
  const month = day.slice(0, 7);
  return MODES.flatMap((mode) => {
    const ofMode = runs.filter((run) => run.mode === mode);
    const onDay = ofMode.filter((run) => run.day === day);
    if (onDay.length === 0) return [];
    const inMonth = ofMode.filter((run) => run.day.startsWith(month));
    return [
      {
        mode,
        dayBest: bestScore(onDay),
        monthBest: bestScore(inMonth),
        everBest: bestScore(ofMode),
      },
    ];
  });
}

function answersOf(runs: readonly PlayedRun[], mode: PlayMode): Answers {
  const ofMode = runs.filter((run) => run.mode === mode);
  return {
    answered: ofMode.reduce((sum, run) => sum + run.answered, 0),
    right: ofMode.reduce((sum, run) => sum + run.right, 0),
  };
}

/** Words answered for the first time on `day`. */
function newWordsOn(day: string, wordEvents: readonly GameEvent[]): number {
  const firstDay = new Map<string, string>();
  for (const event of wordEvents) {
    const isAnswer = event.kind === 'match' || event.kind === 'miss' || event.kind === 'timeout';
    if (!isAnswer || event.word_id === null || firstDay.has(event.word_id)) continue;
    firstDay.set(event.word_id, localDayOf(event.at));
  }
  return [...firstDay.values()].filter((first) => first === day).length;
}

export function summariseDay(day: string, history: PlayHistory): DaySummary {
  const onDay = history.runs.filter((run) => run.day === day && run.answered > 0);
  const playedMs = onDay.reduce((sum, run) => sum + run.lastPlayedAtMs - run.startedAtMs, 0);
  const points = history.grammarEvents.filter((event) => localDayOf(event.at) === day);
  return {
    runs: onDay.length,
    minutes: Math.round(playedMs / MS_PER_MINUTE),
    scores: scoresOn(day, history.runs),
    words: answersOf(onDay, 'words'),
    grammar: answersOf(onDay, 'bunpou'),
    newWords: newWordsOn(day, history.wordEvents),
    grammarPoints: new Set(points.map((event) => event.point_id)).size,
    haikuIds: [...onDay]
      .sort((a, b) => a.startedAtMs - b.startedAtMs)
      .flatMap((run) => (run.haikuId === undefined ? [] : [run.haikuId])),
    kanji: kanjiOfDay(day, history.wordEvents, history.wordTextById, history.kanjiRounds),
  };
}
