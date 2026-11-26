import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRunLog } from '../src/composables/useRunLog.ts';
import { tallyWordEvents } from '../src/memory/play-log.ts';
import { deleteAllData, loadRuns } from '../src/memory/storage.ts';
import { answer } from './helpers/events.ts';

/** Saves are fire-and-forget; this lets them land before the test reads. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 20));

describe('the play log', () => {
  beforeEach(() => deleteAllData());

  it('counts a match as right, and a miss or a timeout as wrong', () => {
    const events = [
      answer('w1', '2026-11-26', 'clean'),
      answer('w2', '2026-11-26', 'miss'),
      answer('w3', '2026-11-26', 'timeout'),
      answer('w4', '2026-11-26', 'peek'),
    ];
    expect(tallyWordEvents(events)).toEqual({ answered: 3, right: 1 });
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
});
