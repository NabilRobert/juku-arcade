/**
 * The barebones export (A1, decision D18): this browser's event logs as an
 * anonymous JSON file, which the player chooses to send to their teacher:
 * the word log and, from format 2, the grammar log (D57). The report
 * script (slice 5b) reads a folder of these files; a format 1 file simply
 * has no grammar.
 */
import type { GameEvent } from '../game/events.ts';
import type { GrammarEvent } from '../grammar/grammar-events.ts';
import type { Settings } from './storage.ts';

/** 2 added the grammar log. */
export const EXPORT_FORMAT_VERSION = 2;

export interface ExportFile {
  format_version: number;
  exported_at: string;
  player_id: string;
  class_code: string | null;
  level: string;
  event_count: number;
  events: readonly GameEvent[];
  /** Missing from format 1 files, made before grammar was exported. */
  grammar_event_count?: number;
  grammar_events?: readonly GrammarEvent[];
}

export function buildExport(
  events: readonly GameEvent[],
  settings: Settings,
  exportedAt: Date,
  grammarEvents: readonly GrammarEvent[] = [],
): ExportFile {
  return {
    format_version: EXPORT_FORMAT_VERSION,
    exported_at: exportedAt.toISOString(),
    player_id: settings.playerId,
    class_code: settings.classCode,
    level: settings.level,
    event_count: events.length,
    events,
    grammar_event_count: grammarEvents.length,
    grammar_events: grammarEvents,
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
