/**
 * The pinned OpenJLPT build, and reading its SQLite file (decision D15).
 *
 * The commit and checksum are the ones Juku pins (juku-agents
 * packages/juku-data/src/juku_data/dictionary/pin.py at 4e6c409), so both
 * projects use the same data. Moving to a newer build is a reviewed change
 * to this file.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { JlptLevel } from '../src/deck/types.ts';
import type { KanjiReadings } from '../src/deck/readings.ts';

export const OPENJLPT_COMMIT = 'bf4e1eecd5d11406aaecdee910464507aef7fcdc';
const SQLITE_SHA256 = '5263ba7a5000a9013baa646b3b80241161028fc561c092d57dc8b864ae92b271';
const SQLITE_URL = `https://raw.githubusercontent.com/evanclan/OpenJLPT/${OPENJLPT_COMMIT}/data/openjlpt.sqlite`;
const SQLITE_PATH = 'data/raw/openjlpt.sqlite';

export interface VocabRow {
  id: string;
  word: string;
  reading: string;
  otherReadings: string[];
  level: JlptLevel;
}

export interface KanjiRow extends KanjiReadings {
  /** KANJIDIC2's frequency rank (1 is the most common); null when unranked. */
  frequencyRank: number | null;
}

async function download(): Promise<void> {
  const response = await fetch(SQLITE_URL);
  if (!response.ok) {
    throw new Error(`Downloading OpenJLPT failed (HTTP ${response.status}) from ${SQLITE_URL}`);
  }
  mkdirSync(dirname(SQLITE_PATH), { recursive: true });
  writeFileSync(SQLITE_PATH, Buffer.from(await response.arrayBuffer()));
}

/** Downloads the pinned file if it's missing, then checks it is exactly the pinned build. */
export async function openPinnedDatabase(): Promise<DatabaseSync> {
  if (!existsSync(SQLITE_PATH)) await download();
  const actual = createHash('sha256').update(readFileSync(SQLITE_PATH)).digest('hex');
  if (actual !== SQLITE_SHA256) {
    throw new Error(
      `${SQLITE_PATH} is not the pinned OpenJLPT build (sha256 ${actual}). ` +
        'Delete it and run `npm run decks` to download it again.',
    );
  }
  return new DatabaseSync(SQLITE_PATH, { readOnly: true });
}

function parseList(json: unknown): string[] {
  return typeof json === 'string' ? (JSON.parse(json) as string[]) : [];
}

export function readVocab(database: DatabaseSync): VocabRow[] {
  const rows = database
    .prepare('SELECT id, word, reading, other_readings, level FROM vocab ORDER BY level DESC, id')
    .all();
  return rows.map((row) => ({
    id: String(row.id),
    word: String(row.word),
    reading: String(row.reading),
    otherReadings: parseList(row.other_readings),
    level: String(row.level) as JlptLevel,
  }));
}

export function readKanji(database: DatabaseSync): Map<string, KanjiRow> {
  const rows = database.prepare('SELECT character, onyomi, kunyomi, freq FROM kanji').all();
  const table = new Map<string, KanjiRow>();
  for (const row of rows) {
    table.set(String(row.character), {
      onyomi: parseList(row.onyomi),
      kunyomi: parseList(row.kunyomi),
      frequencyRank: typeof row.freq === 'number' ? row.freq : null,
    });
  }
  return table;
}
