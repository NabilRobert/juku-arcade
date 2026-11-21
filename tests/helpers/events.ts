// Builds answer events at fixed local times, so memory tests don't depend on the clock.
import { makeEvent, type GameEvent } from '../../src/game/events.ts';

const IDENTITY = { playerId: 'player-1', sessionId: 'session-1', classCode: null };

export function answer(
  wordId: string,
  day: string,
  kind: 'clean' | 'miss' | 'peek' | 'timeout',
): GameEvent {
  const at = `${day}T10:00:00+07:00`;
  if (kind === 'clean')
    return makeEvent(IDENTITY, new Date(), {
      kind: 'match',
      outcome: 'clean',
      word_id: wordId,
      at,
      level: 1,
      set_index: 0,
    });
  return makeEvent(IDENTITY, new Date(), { kind, word_id: wordId, at, level: 1, set_index: 0 });
}
