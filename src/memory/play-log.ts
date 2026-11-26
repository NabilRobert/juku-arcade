/**
 * The play log, for the streak and the play calendar on the start screen:
 * one record per run, in any mode, and one per kanji-mode round. A run is
 * recorded from its first answer and updated with each one after, so a run
 * counts for its day even when the player just closes the game. Only an
 * answer the player gave counts, right or wrong: a set or a sentence that
 * just timed out doesn't, so opening a mode and leaving it doesn't keep a
 * streak (playtest decision, 2026-11-26).
 *
 * Neither record is a review event: the reviews and the school's measures
 * never read them (D37), and they stay in this browser.
 */
import { wordAnswerScore, type GameEvent } from '../game/events.ts';
import { translate } from '../i18n/index.ts';

/** Every mode, in the order the start screen, the boards and a day's scores list them. */
export const PLAY_MODES = ['words', 'kanji', 'bunpou', 'dojo'] as const;
export type PlayMode = (typeof PLAY_MODES)[number];

// Each key is written out, not built from the mode, so the message check (i18n-messages.test.ts) sees it.
const MODE_NAMES: Readonly<Record<PlayMode, () => string>> = {
  words: () => translate('modes.words.name'),
  kanji: () => translate('modes.kanji.name'),
  bunpou: () => translate('modes.bunpou.name'),
  dojo: () => translate('modes.dojo.name'),
};

/** A mode's name on screen, in the interface language; the dojo is "Practice" to players (D62). */
export function modeName(mode: PlayMode): string {
  return MODE_NAMES[mode]();
}

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
  /** The haiku a Bunpou show closed on (D59), once it has. */
  haikuId?: string;
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

export type Answers = Omit<RunTally, 'score'>;
export type AnswerOutcome = 'right' | 'wrong' | 'timeout';

/** The answers after one more; a timeout isn't an answer the player gave, so it isn't counted. */
export function withAnswer(answers: Answers, outcome: AnswerOutcome): Answers {
  if (outcome === 'timeout') return answers;
  return { answered: answers.answered + 1, right: answers.right + (outcome === 'right' ? 1 : 0) };
}

/**
 * Word mode's answers in a run, scored as the stats page scores them
 * (wordAnswerScore): a match is right and a miss wrong; a peeked match and
 * a timeout aren't counted.
 */
export function tallyWordEvents(events: readonly GameEvent[]): Answers {
  let answers: Answers = { answered: 0, right: 0 };
  for (const event of events) {
    const score = wordAnswerScore(event);
    if (score !== null) answers = withAnswer(answers, score);
  }
  return answers;
}
