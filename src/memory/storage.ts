/**
 * The browser's copy of everything (decisions D14, N5): the word event log,
 * the grammar event log (D57, kept apart so word memory never reads a
 * grammar answer), the play log (play-log.ts) and a few settings, in
 * IndexedDB through Dexie. Nothing leaves the browser until
 * the player exports it (slice 5a).
 */
import Dexie, { type Table } from 'dexie';
import type { JlptLevel } from '../deck/types.ts';
import type { GameEvent } from '../game/events.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import type { KanjiRoundRecord, PlayedRun } from './play-log.ts';
import { PROGRESS_KEYS } from './progress-keys.ts';

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
  grammarEvents!: Table<GrammarEvent & { seq?: number }, number>;
  runs!: Table<PlayedRun, string>;
  kanjiRounds!: Table<KanjiRoundRecord & { seq?: number }, number>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores({ events: '++seq, &event_id', settings: 'key' });
    // Version 2 adds the grammar log; the word log and settings carry over untouched.
    this.version(2).stores({ grammarEvents: '++seq, &event_id' });
    // Version 3 adds the play log (play-log.ts), for the streak and the calendar.
    this.version(3).stores({ runs: 'id, day', kanjiRounds: '++seq, day' });
  }
}

const database = new ArcadeDatabase();

/** A stored row without its `seq`, which only keeps the order. */
function withoutSeq<T extends { seq?: number }>(row: T): Omit<T, 'seq'> {
  const copy = { ...row };
  delete copy.seq;
  return copy;
}

export async function loadEvents(): Promise<GameEvent[]> {
  return (await database.events.orderBy('seq').toArray()).map(withoutSeq);
}

export async function appendEvents(events: readonly GameEvent[]): Promise<void> {
  if (events.length > 0) await database.events.bulkAdd([...events]);
}

export async function loadGrammarEvents(): Promise<GrammarEvent[]> {
  return (await database.grammarEvents.orderBy('seq').toArray()).map(withoutSeq);
}

export async function appendGrammarEvents(events: readonly GrammarEvent[]): Promise<void> {
  if (events.length > 0) await database.grammarEvents.bulkAdd([...events]);
}

/** Saves a run as it stands, replacing its earlier copy. */
export async function saveRun(run: PlayedRun): Promise<void> {
  await database.runs.put(run);
}

export async function loadRuns(): Promise<PlayedRun[]> {
  return database.runs.toArray();
}

export async function appendKanjiRound(round: KanjiRoundRecord): Promise<void> {
  await database.kanjiRounds.add({ ...round });
}

export async function loadKanjiRounds(): Promise<KanjiRoundRecord[]> {
  return (await database.kanjiRounds.orderBy('seq').toArray()).map(withoutSeq);
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

/**
 * "Delete my data" (N5): removes every event, word or grammar, every
 * setting, the play log, and the progress kept outside the database
 * (progress-keys.ts: the best scores and the haiku collection) from this
 * browser.
 */
export async function deleteAllData(): Promise<void> {
  const tables = [
    database.events,
    database.grammarEvents,
    database.settings,
    database.runs,
    database.kanjiRounds,
  ];
  await database.transaction('rw', tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
  });
  try {
    for (const key of PROGRESS_KEYS) localStorage.removeItem(key);
  } catch {
    // Storage can be blocked (a private window); then nothing was kept there.
  }
}
