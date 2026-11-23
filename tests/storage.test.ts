import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  appendEvents,
  deleteAllData,
  loadEvents,
  loadSettings,
  saveSettings,
} from '../src/memory/storage.ts';
import { answer } from './helpers/events.ts';

describe('browser storage', () => {
  it('keeps events in the order they were added', async () => {
    const first = answer('w1', '2026-11-21', 'clean');
    const second = answer('w2', '2026-11-21', 'miss');
    await appendEvents([first]);
    await appendEvents([second]);
    expect((await loadEvents()).map((event) => event.event_id)).toEqual([
      first.event_id,
      second.event_id,
    ]);
  });

  it('saves and loads settings', async () => {
    const settings = {
      playerId: 'p',
      level: 'N5' as const,
      classCode: 'N5-SAT',
      bestCombo: 3,
      playDay: '2026-11-21',
      playMsToday: 60_000,
      checkUpOfferedDay: '2026-11-21',
    };
    await saveSettings(settings);
    expect(await loadSettings()).toEqual(settings);
  });

  it('fills in play time for settings saved before it existed', async () => {
    const older = {
      playerId: 'p',
      level: 'N5' as const,
      classCode: null,
      bestCombo: 0,
    };
    await saveSettings(older as Parameters<typeof saveSettings>[0]);
    expect(await loadSettings()).toMatchObject({
      playDay: null,
      playMsToday: 0,
      checkUpOfferedDay: null,
    });
  });

  it('deletes every event and setting', async () => {
    await deleteAllData();
    expect([await loadEvents(), await loadSettings()]).toEqual([[], null]);
  });
});
