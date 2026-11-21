/**
 * Reads a folder of exports (A1) and checks the data (A4): merges every
 * file's events, drops duplicates by event_id (the same export sent twice),
 * flags unknown schema versions and clock jumps, and keeps events in order.
 * It also keeps each player's JLPT level, from their latest export, so the
 * deck measures (S2, S3) know which deck the player was on.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EVENT_SCHEMA_VERSION, type GameEvent } from '../../src/game/events.ts';
import type { ExportFile } from '../../src/memory/export.ts';

/** An event more than this much earlier than the one before it, in a session, is a clock jump. */
const CLOCK_JUMP_MS = 60_000;

export interface DataQuality {
  filesRead: number;
  eventsRead: number;
  duplicatesDropped: number;
  unknownSchemaEvents: number;
  clockJumps: number;
  players: number;
}

export interface LoadedData {
  events: GameEvent[];
  quality: DataQuality;
  /** Each player's JLPT level (N5 and so on), from their latest export. */
  levelByPlayer: Map<string, string>;
}

function latestLevels(files: readonly ExportFile[]): Map<string, string> {
  const byExportTime = [...files].sort((a, b) => a.exported_at.localeCompare(b.exported_at));
  return new Map(byExportTime.map((file) => [file.player_id, file.level]));
}

function countClockJumps(events: readonly GameEvent[]): number {
  const lastBySession = new Map<string, number>();
  let jumps = 0;
  for (const event of events) {
    const at = Date.parse(event.at);
    const previous = lastBySession.get(event.session_id);
    if (previous !== undefined && at < previous - CLOCK_JUMP_MS) jumps += 1;
    lastBySession.set(event.session_id, at);
  }
  return jumps;
}

export function mergeExports(files: readonly ExportFile[]): LoadedData {
  const seen = new Set<string>();
  const events: GameEvent[] = [];
  let eventsRead = 0;
  for (const file of files) {
    for (const event of file.events) {
      eventsRead += 1;
      if (seen.has(event.event_id)) continue;
      seen.add(event.event_id);
      events.push(event);
    }
  }
  const quality: DataQuality = {
    filesRead: files.length,
    eventsRead,
    duplicatesDropped: eventsRead - events.length,
    unknownSchemaEvents: events.filter((event) => event.schema_version !== EVENT_SCHEMA_VERSION)
      .length,
    clockJumps: countClockJumps(events),
    players: new Set(events.map((event) => event.player_id)).size,
  };
  return { events, quality, levelByPlayer: latestLevels(files) };
}

export function readExportFolder(folder: string): LoadedData {
  const names = readdirSync(folder).filter((name) => name.endsWith('.json'));
  const files = names.map(
    (name) => JSON.parse(readFileSync(join(folder, name), 'utf8')) as ExportFile,
  );
  return mergeExports(files);
}
