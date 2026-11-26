import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRunLog } from '../src/composables/useRunLog.ts';
import { makeEvent } from '../src/game/events.ts';
import { tallyWordEvents, withAnswer } from '../src/memory/play-log.ts';
import { countAnswers } from '../src/memory/stats.ts';
import { deleteAllData, loadRuns } from '../src/memory/storage.ts';
import { answer } from './helpers/events.ts';

/** Saves are fire-and-forget; this lets them land before the test reads. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 20));

describe('the play log', () => {
  beforeEach(() => deleteAllData());

  it('counts a match as right and a miss as wrong, but not a timeout the player never answered', () => {
    const events = [
      answer('w1', '2026-11-26', 'clean'),
      answer('w2', '2026-11-26', 'miss'),
      answer('w3', '2026-11-26', 'timeout'),
      answer('w4', '2026-11-26', 'peek'),
    ];
    expect(tallyWordEvents(events)).toEqual({ answered: 2, right: 1 });
  });

  it('scores a peeked match as the stats page does: not right, and not counted (L9)', () => {
    const peekedMatch = makeEvent(
      { playerId: 'player-1', sessionId: 'session-1', classCode: null },
      new Date(),
      {
        kind: 'match',
        outcome: 'peeked',
        word_id: 'w1',
        at: '2026-11-26T10:00:00+07:00',
        level: 1,
        set_index: 0,
      },
    );
    const events = [peekedMatch, answer('w2', '2026-11-26', 'clean')];
    expect(tallyWordEvents(events)).toEqual({ answered: 1, right: 1 });
    const stats = countAnswers(events);
    expect(stats.right + stats.wrong).toBe(tallyWordEvents(events).answered);
  });

  it('counts only answers the player gave, in any mode', () => {
    const start = { answered: 0, right: 0 };
    expect(withAnswer(start, 'right')).toEqual({ answered: 1, right: 1 });
    expect(withAnswer(start, 'wrong')).toEqual({ answered: 1, right: 0 });
    expect(withAnswer(start, 'timeout')).toEqual(start);
  });

  it('records nothing before the first answer', async () => {
    useRunLog('words').record({ score: 0, answered: 0, right: 0 });
    await settle();
    expect(await loadRuns()).toEqual([]);
  });

  it('keeps one record per run, updated with each answer', async () => {
    const log = useRunLog('kanji');
    log.record({ score: 10, answered: 1, right: 1 });
    log.record({ score: 10, answered: 2, right: 1 });
    await settle();
    const runs = await loadRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ mode: 'kanji', score: 10, answered: 2, right: 1 });
  });

  it('keeps the haiku a show closed on with its run', async () => {
    const log = useRunLog('bunpou');
    log.addHaiku('park');
    log.record({ score: 100, answered: 1, right: 1 });
    log.addHaiku('park');
    await settle();
    expect(await loadRuns()).toMatchObject([{ mode: 'bunpou', haikuId: 'park' }]);
  });
});
