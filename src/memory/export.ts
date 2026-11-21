/**
 * The barebones export (A1, decision D18): this browser's event log as an
 * anonymous JSON file, which the player chooses to send to their teacher.
 * The report script (slice 5b) reads a folder of these files.
 */
import type { GameEvent } from '../game/events.ts';
import type { Settings } from './storage.ts';

export const EXPORT_FORMAT_VERSION = 1;

export interface ExportFile {
  format_version: number;
  exported_at: string;
  player_id: string;
  class_code: string | null;
  level: string;
  event_count: number;
  events: readonly GameEvent[];
}

export function buildExport(
  events: readonly GameEvent[],
  settings: Settings,
  exportedAt: Date,
): ExportFile {
  return {
    format_version: EXPORT_FORMAT_VERSION,
    exported_at: exportedAt.toISOString(),
    player_id: settings.playerId,
    class_code: settings.classCode,
    level: settings.level,
    event_count: events.length,
    events,
  };
}

/** A short, anonymous file name: juku-arcade-<first 8 of the player ID>-<date>.json. */
export function exportFileName(file: ExportFile): string {
  return `juku-arcade-${file.player_id.slice(0, 8)}-${file.exported_at.slice(0, 10)}.json`;
}

/** Hands the file to the browser's download; nothing is sent anywhere. */
export function downloadExport(file: ExportFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = exportFileName(file);
  link.click();
  URL.revokeObjectURL(link.href);
}
