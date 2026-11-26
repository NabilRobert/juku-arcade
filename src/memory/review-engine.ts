/**
 * The review engine the game talks to (R1). Its shape follows Juku's engine
 * API (recommend_words, record_quiz_answer, get_progress in Juku's
 * engine/api.py, NabilRobert/juku-agents-ai), so a Juku-backed version can replace this local one after
 * the playtest without the game changing.
 */
import type { DeckWord } from '../deck/types.ts';
import type { RandomSource } from '../game/deal.ts';
import type { GameEvent } from '../game/events.ts';
import type { WordHistory } from '../game/run.ts';
import type { TagTable } from '../game/tags.ts';
import { dailyProgress, poolForNextSet, type DailyProgress } from './daily-deck.ts';
import { learnedTags } from './difficulty.ts';
import { addDays, daysBetween, localDayOf } from './days.ts';
import { applyEvent, deriveMemory, isWordKnown, type Memory } from './word-memory.ts';

export const CALENDAR_DAYS = 7;

export interface Progress {
  /** R7: words answered right on 2 separate days, out of the deck. */
  wordsKnown: number;
  deckSize: number;
  daily: DailyProgress;
  /** L12: days played out of the last 7, never a streak that breaks. */
  daysPlayedThisWeek: number;
}

export interface ReviewEngine {
  /** Juku: record_quiz_answer. Takes the game's events; only answers change memory. */
  recordEvents(events: readonly GameEvent[]): void;
  /** Juku: recommend_words. The pool the next set is dealt from. */
  recommendWords(today: string, random: RandomSource): DeckWord[];
  /** Juku: get_progress. */
  getProgress(today: string): Progress;
  tags(): TagTable;
  history(wordId: string, today: string): WordHistory;
}

function daysPlayedSince(memory: Memory, today: string): number {
  const firstDay = addDays(today, 1 - CALENDAR_DAYS);
  return [...memory.daysPlayed].filter((day) => day >= firstDay && day <= today).length;
}

export function createLocalEngine(
  words: readonly DeckWord[],
  pastEvents: readonly GameEvent[],
): ReviewEngine {
  const memory = deriveMemory(pastEvents);
  return {
    recordEvents: (events) => events.forEach((event) => applyEvent(memory, event)),
    recommendWords: (today, random) => poolForNextSet(words, memory, today, random),
    getProgress: (today) => ({
      wordsKnown: words.filter((word) => isWordKnown(memory, word.id)).length,
      deckSize: words.length,
      daily: dailyProgress(words, memory, today),
      daysPlayedThisWeek: daysPlayedSince(memory, today),
    }),
    tags: () => learnedTags(words, memory),
    history: (wordId, today) => {
      const record = memory.words.get(wordId);
      if (record === undefined)
        return { timesSeenBefore: 0, daysSinceLastSeen: null, boxBefore: null };
      const lastDay = localDayOf(record.lastAnswerAt);
      return {
        timesSeenBefore: record.attempts,
        daysSinceLastSeen: daysBetween(lastDay, today),
        boxBefore: record.box,
      };
    },
  };
}
