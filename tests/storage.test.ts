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
      bestSetScore: 90,
    };
    await saveSettings(settings);
    expect(await loadSettings()).toEqual(settings);
  });

  it('deletes every event and setting', async () => {
    await deleteAllData();
    expect([await loadEvents(), await loadSettings()]).toEqual([[], null]);
  });
});
