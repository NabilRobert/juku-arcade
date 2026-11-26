/**
 * The play log, for the streak and the play calendar on the start screen:
 * one record per run, in any mode, and one per kanji-mode round. A run is
 * recorded from its first answer and updated with each one after, so a run
 * counts for its day even when the player just closes the game.
 *
 * Neither record is a review event: the reviews and the school's measures
 * never read them (D37), and they stay in this browser.
 */
import type { GameEvent } from '../game/events.ts';

export type PlayMode = 'words' | 'kanji' | 'bunpou';

/** One run, as it stood after its last answer. */
export interface PlayedRun {
  id: string;
  mode: PlayMode;
  /** The local day the run started on (YYYY-MM-DD). */
  day: string;
  startedAtMs: number;
  lastPlayedAtMs: number;
  score: number;
  answered: number;
  right: number;
}

/** A run's numbers so far, as each mode counts them. */
export interface RunTally {
  score: number;
  answered: number;
  right: number;
}

/** One kanji-mode round: perfect when every reading was found with no wrong pick. */
export interface KanjiRoundRecord {
  day: string;
  kanji: string;
  isPerfect: boolean;
}

/** Word mode's answers in a run: a match is right; a miss or a timeout is wrong. */
export function tallyWordEvents(events: readonly GameEvent[]): Omit<RunTally, 'score'> {
  let answered = 0;
  let right = 0;
  for (const event of events) {
    if (event.kind === 'match') right += 1;
    if (event.kind === 'match' || event.kind === 'miss' || event.kind === 'timeout') answered += 1;
  }
  return { answered, right };
}
