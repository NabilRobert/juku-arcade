// Upgrading the browser database to add the grammar log keeps a player's word log and settings.
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { expect, it } from 'vitest';
import { answer } from './helpers/events.ts';

it('keeps the word log and settings when the grammar log is added', async () => {
  const older = new Dexie('juku-arcade');
  older.version(1).stores({ events: '++seq, &event_id', settings: 'key' });
  const saved = answer('w1', '2026-11-20', 'clean');
  await older.table('events').add({ ...saved });
  await older.table('settings').put({ key: 'settings', value: { playerId: 'p', level: 'N5' } });
  older.close();

  const storage = await import('../src/memory/storage.ts');
  expect(await storage.loadEvents()).toEqual([saved]);
  expect(await storage.loadSettings()).toMatchObject({ playerId: 'p' });
  expect(await storage.loadGrammarEvents()).toEqual([]);
});
