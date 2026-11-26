// Play time is saved as additions, so two play clocks (one mode closing as the next opens) never lose time.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { playTimeSaver } from '../src/memory/play-time-saver.ts';
import { deleteAllData, loadSettings, saveSettings, type Settings } from '../src/memory/storage.ts';

const TODAY = '2026-11-26';
const SETTINGS: Settings = {
  playerId: 'p',
  level: 'N5',
  classCode: null,
  bestCombo: 0,
  playDay: TODAY,
  playMsToday: 60_000,
  checkUpOfferedDay: null,
};

/** Saves are fire-and-forget; this lets them land before the test reads. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(async () => {
  await deleteAllData();
  await saveSettings(SETTINGS);
});

describe('saving play time', () => {
  it("adds what each clock counted to today's total, even when two overlap", async () => {
    const closing = playTimeSaver(() => TODAY);
    const opening = playTimeSaver(() => TODAY);
    closing.add(5_000);
    opening.add(3_000);
    opening.flush();
    closing.flush();
    await settle();
    expect((await loadSettings())?.playMsToday).toBe(60_000 + 5_000 + 3_000);
  });

  it('saves each stretch of play once', async () => {
    const saver = playTimeSaver(() => TODAY);
    saver.add(2_000);
    saver.flush();
    saver.flush();
    await settle();
    expect((await loadSettings())?.playMsToday).toBe(62_000);
  });

  it('starts a new day from zero', async () => {
    const saver = playTimeSaver(() => '2026-11-27');
    saver.add(4_000);
    saver.flush();
    await settle();
    expect(await loadSettings()).toMatchObject({ playDay: '2026-11-27', playMsToday: 4_000 });
  });
});
