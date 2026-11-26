/**
 * Kanji reviews (D75): each kanji has its own spaced reviews, on the same
 * Leitner schedule as words and grammar points (memory/leitner.ts:
 * afterAnswer), rebuilt on load from the kanji rounds the play log keeps.
 * A perfect round is a right answer and moves the kanji up a box; any
 * other round sends it back to box 1, so a missed kanji is due tomorrow.
 *
 * They're kept apart from the word reviews and the events the school's
 * reports read, which still come from word mode only (D37).
 */
import { afterAnswer, NEW_WORD, type LeitnerState } from '../memory/leitner.ts';
import type { KanjiRoundRecord } from '../memory/play-log.ts';
import type { KanjiStanding } from './sheet-mix.ts';

export interface KanjiMemory extends LeitnerState {
  lastAnswerDay: string;
}

/** Every kanji played so far, from its rounds in the order they were played. */
export function kanjiReviewsOf(rounds: readonly KanjiRoundRecord[]): Map<string, KanjiMemory> {
  const memory = new Map<string, KanjiMemory>();
  for (const round of rounds) {
    const before = memory.get(round.kanji) ?? NEW_WORD;
    memory.set(round.kanji, {
      ...afterAnswer(before, round.isPerfect, round.day),
      lastAnswerDay: round.day,
    });
  }
  return memory;
}

/** Due on or before today, and not yet answered today. */
export function isKanjiDue(record: KanjiMemory, today: string): boolean {
  return record.dueDay !== null && record.dueDay <= today && record.lastAnswerDay !== today;
}

/**
 * What a sheet needs to know to pick each round's kanji: which are due,
 * and which were played but aren't due yet (they rest). Kanji dealt
 * earlier in this run rest too, so a sheet never deals one twice as new.
 */
export function kanjiStanding(
  memory: ReadonlyMap<string, KanjiMemory>,
  today: string,
  levelList: ReadonlySet<string>,
  dealtThisRun: ReadonlySet<string>,
): KanjiStanding {
  const due = new Set<string>();
  const resting = new Set<string>(dealtThisRun);
  for (const [kanji, record] of memory) {
    if (dealtThisRun.has(kanji)) continue;
    if (isKanjiDue(record, today)) due.add(kanji);
    else resting.add(kanji);
  }
  return { due, resting, levelList };
}
