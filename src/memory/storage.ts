/**
 * The browser's copy of everything (decisions D14, N5): the event log and a
 * few settings, in IndexedDB through Dexie. Nothing leaves the browser until
 * the player exports it (slice 5a).
 */
import Dexie, { type Table } from 'dexie';
import type { JlptLevel } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';

const DATABASE_NAME = 'juku-arcade';

/** An event as stored: `seq` keeps the order the events happened in. */
type StoredEvent = GameEvent & { seq?: number };

export interface Settings {
  playerId: string;
  level: JlptLevel;
  classCode: string | null;
  bestCombo: number;
  /** W2: the local day the play time is for, and today's play so far. */
  playDay: string | null;
  playMsToday: number;
  /** C1: the last day the check-up was offered, so it's offered once a day. */
  checkUpOfferedDay: string | null;
}

interface SettingsRow {
  key: 'settings';
  value: Settings;
}

class ArcadeDatabase extends Dexie {
  events!: Table<StoredEvent, number>;
  settings!: Table<SettingsRow, string>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores({ events: '++seq, &event_id', settings: 'key' });
  }
}

const database = new ArcadeDatabase();

export async function loadEvents(): Promise<GameEvent[]> {
  const stored = await database.events.orderBy('seq').toArray();
  return stored.map((event) => {
    const copy = { ...event };
    delete copy.seq;
    return copy;
  });
}

export async function appendEvents(events: readonly GameEvent[]): Promise<void> {
  if (events.length > 0) await database.events.bulkAdd([...events]);
}

export async function loadSettings(): Promise<Settings | null> {
  const saved = (await database.settings.get('settings'))?.value;
  if (saved === undefined) return null;
  // Settings saved by earlier versions lack the newer fields.
  return {
    ...saved,
    playDay: saved.playDay ?? null,
    playMsToday: saved.playMsToday ?? 0,
    checkUpOfferedDay: saved.checkUpOfferedDay ?? null,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await database.settings.put({ key: 'settings', value: settings });
}

/** "Delete my data" (N5): removes every event and setting from this browser. */
export async function deleteAllData(): Promise<void> {
  await database.transaction('rw', database.events, database.settings, async () => {
    await database.events.clear();
    await database.settings.clear();
  });
}
