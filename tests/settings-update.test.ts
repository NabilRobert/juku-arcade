// Saving part of the settings from a copy taken earlier (the play clocks, the best combo) must not undo
// newer changes or bring deleted settings back.
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteAllData,
  loadSettings,
  saveSettings,
  updateSavedSettings,
  type Settings,
} from '../src/memory/storage.ts';

const SETTINGS: Settings = {
  playerId: 'p',
  level: 'N5',
  classCode: null,
  bestCombo: 0,
  playDay: null,
  playMsToday: 0,
  checkUpOfferedDay: null,
};

beforeEach(async () => {
  await deleteAllData();
});

describe('saving part of the settings', () => {
  it('changes only the fields given, keeping a level changed since the copy was taken', async () => {
    await saveSettings(SETTINGS);
    // The player changes level in Settings while a mode's play clock still holds the old copy.
    await saveSettings({ ...SETTINGS, level: 'N4' });
    await updateSavedSettings((saved) => ({
      ...saved,
      playDay: '2026-11-26',
      playMsToday: 60_000,
    }));
    expect(await loadSettings()).toMatchObject({
      level: 'N4',
      playDay: '2026-11-26',
      playMsToday: 60_000,
    });
  });

  it('does nothing once the settings are deleted, so "Delete my data" stays deleted', async () => {
    await saveSettings(SETTINGS);
    await deleteAllData();
    await updateSavedSettings((saved) => ({ ...saved, playMsToday: 60_000 }));
    expect(await loadSettings()).toBeNull();
  });
});
