/**
 * The tale's performance (D58), as pure rules: how the storyteller tells
 * each line, how the crowd takes the whole tale, and when a chapter ends.
 *
 * A right line is told with the fan raised; a wrong one is told exactly
 * as built and he trips over it; a line that timed out, he forgets
 * (えーと…). The crowd's reaction follows the plan's table: every line
 * right is a roar, louder still at an S rank or above; one wrong, a laugh;
 * two, a polite chuckle; three or more, silence. Every TALES_PER_CHAPTER
 * tales, the chapter is shown together as a scroll.
 */
import { rankFor } from '../game/combo-ranks.ts';
import type { StorytellerPose } from '../components/bunpou/stage-sprites.ts';
import type { LineResult } from './bunpou-run.ts';

export type CrowdReaction = 'roar' | 'laugh' | 'chuckle' | 'silence';

export const TALES_PER_CHAPTER = 3;
/** How long each line is told before the next: a wrong line stays up longer, with its fix. */
export const LINE_TOLD_MS = { right: 1600, wrong: 3200, timeout: 2600 } as const;
/** The ranks at which a roar gets louder. */
const LOUDER_RANKS: ReadonlySet<string> = new Set(['S', 'SS', 'SSS']);

/** What the crowd shouts, in Japanese only (the mode has no English). */
export const CROWD_SHOUTS: Readonly<Record<CrowdReaction, string>> = {
  roar: '大爆笑！',
  laugh: 'あはは！',
  chuckle: 'くすくす…',
  silence: 'しーん…',
};

export function lineOutcome(result: LineResult): keyof typeof LINE_TOLD_MS {
  if (result.isTimedOut) return 'timeout';
  return result.isRight ? 'right' : 'wrong';
}

export function poseFor(result: LineResult): StorytellerPose {
  const outcome = lineOutcome(result);
  if (outcome === 'timeout') return 'forgot';
  return outcome === 'right' ? 'perform' : 'trip';
}

export function crowdReaction(results: readonly LineResult[]): CrowdReaction {
  const wrong = results.filter((result) => !result.isRight).length;
  if (wrong === 0) return 'roar';
  if (wrong === 1) return 'laugh';
  return wrong === 2 ? 'chuckle' : 'silence';
}

/** A roar is louder when the tale ends at an S rank or above. */
export function isLouderRoar(results: readonly LineResult[], combo: number): boolean {
  const letter = rankFor(combo).rank?.letter;
  return crowdReaction(results) === 'roar' && letter !== undefined && LOUDER_RANKS.has(letter);
}

/** After telling this many tales in a run, does a chapter end? */
export function endsChapter(talesTold: number): boolean {
  return talesTold > 0 && talesTold % TALES_PER_CHAPTER === 0;
}
