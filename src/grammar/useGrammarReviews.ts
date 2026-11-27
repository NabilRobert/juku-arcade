/**
 * Bunpou's reviews on screen (D57): rebuilds grammar memory from the
 * grammar log, picks each tale's points, and logs every judged line,
 * saving it to the browser and updating memory and today's progress at
 * once. Storage can be blocked (a private window); the run then plays on
 * without saving, as word mode does.
 */
import { shallowRef } from 'vue';
import { localDay, type SessionIdentity } from '../game/events.ts';
import { appendGrammarEvents, type Settings } from '../memory/storage.ts';
import type { LineResult } from './bunpou-run.ts';
import { brokenRule } from './broken-rule.ts';
import { answerText, makeGrammarEvent, type GrammarEvent } from './grammar-events.ts';
import { createGrammarReviews } from './grammar-reviews.ts';

/** How a judged line ended: built right, built wrong, or timed out (also the play log's outcome). */
export function outcomeOf(result: LineResult): GrammarEvent['outcome'] {
  if (result.isTimedOut) return 'timeout';
  return result.isRight ? 'right' : 'wrong';
}

function brokenRuleOf(result: LineResult): GrammarEvent['broken_rule'] {
  if (result.isRight || result.isTimedOut) return null;
  return brokenRule(
    result.answer.filter((tile) => tile !== null),
    result.sentence,
  );
}

/** The boxes as the line started: its given particles, empty elsewhere (D77). */
function givenTiles(result: LineResult): (string | null)[] {
  return result.sentence.tiles.map((tile, index) =>
    result.givenBoxes.includes(index) ? tile.text : null,
  );
}

/** The grammar log event for a judged line. */
function eventFor(
  identity: SessionIdentity,
  result: LineResult,
  msTaken: number,
  boxBefore: number | null,
): GrammarEvent {
  return makeGrammarEvent(identity, new Date(), {
    point_id: result.sentence.point,
    template_id: result.sentence.templateId,
    outcome: outcomeOf(result),
    broken_rule: brokenRuleOf(result),
    answer: answerText(result.answer),
    given_tiles: answerText(givenTiles(result)),
    ms_taken: Math.max(0, Math.round(msTaken)),
    level: result.level,
    combo_before: result.comboBefore,
    box_before: boxBefore,
  });
}

export function useGrammarReviews(
  points: readonly string[],
  settings: Settings,
  pastEvents: readonly GrammarEvent[],
) {
  const reviews = createGrammarReviews(points, pastEvents);
  const identity: SessionIdentity = {
    playerId: settings.playerId,
    sessionId: crypto.randomUUID(),
    classCode: settings.classCode,
  };
  const today = (): string => localDay(new Date());
  const progress = shallowRef(reviews.progress(today()));
  /** This run's lines: every judged one, and the right ones, for the results screen. */
  const lines = shallowRef({ played: 0, right: 0 });

  function logJudged(result: LineResult, msTaken: number): void {
    const event = eventFor(identity, result, msTaken, reviews.boxOf(result.sentence.point));
    reviews.record(event);
    progress.value = reviews.progress(today());
    lines.value = {
      played: lines.value.played + 1,
      right: lines.value.right + (result.isRight ? 1 : 0),
    };
    appendGrammarEvents([event]).catch((error: unknown) =>
      console.warn('Could not save the grammar answer:', error),
    );
  }

  return {
    progress,
    lines,
    logJudged,
    pointsByPriority: () => reviews.pointsByPriority(today()),
  };
}
