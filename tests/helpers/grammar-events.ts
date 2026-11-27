// Builds grammar log events at fixed local times, so review tests don't depend on the clock.
import {
  makeGrammarEvent,
  type GrammarEvent,
  type SentenceOutcome,
} from '../../src/grammar/grammar-events.ts';

const IDENTITY = { playerId: 'player-1', sessionId: 'session-1', classCode: null };

export function sentence(pointId: string, day: string, outcome: SentenceOutcome): GrammarEvent {
  return {
    ...makeGrammarEvent(IDENTITY, new Date(), {
      point_id: pointId,
      template_id: `${pointId}-S`,
      outcome,
      broken_rule: outcome === 'wrong' ? 'verb_not_last' : null,
      answer: 'a|b|c',
      given_tiles: '_|_|_',
      ms_taken: 4000,
      level: 1,
      combo_before: 0,
      box_before: null,
    }),
    at: `${day}T10:00:00+07:00`,
  };
}
