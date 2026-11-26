import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { PlayedRun } from '../src/memory/play-log.ts';
import {
  appendEvents,
  appendGrammarEvents,
  appendKanjiRound,
  deleteAllData,
  loadEvents,
  loadGrammarEvents,
  loadKanjiRounds,
  loadRuns,
  loadSettings,
  saveRun,
  saveSettings,
} from '../src/memory/storage.ts';
import { answer } from './helpers/events.ts';
import { sentence } from './helpers/grammar-events.ts';

const run: PlayedRun = {
  id: 'run-1',
  mode: 'words',
  day: '2026-11-26',
  startedAtMs: 1000,
  lastPlayedAtMs: 2000,
  score: 10,
  answered: 1,
  right: 1,
};

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

  it('keeps grammar answers in their own log, never in the word log', async () => {
    await deleteAllData();
    const grammar = sentence('wa', '2026-11-24', 'right');
    await appendGrammarEvents([grammar]);
    expect(await loadGrammarEvents()).toEqual([grammar]);
    expect(await loadEvents()).toEqual([]);
  });

  it('keeps one copy of a run, the latest saved', async () => {
    await deleteAllData();
    await saveRun(run);
    await saveRun({ ...run, score: 30, answered: 3, right: 3 });
    expect(await loadRuns()).toEqual([{ ...run, score: 30, answered: 3, right: 3 }]);
  });

  it('keeps kanji rounds in the order they were played', async () => {
    await deleteAllData();
    await appendKanjiRound({ day: '2026-11-26', kanji: '生', isPerfect: false });
    await appendKanjiRound({ day: '2026-11-26', kanji: '学', isPerfect: true });
    expect((await loadKanjiRounds()).map((round) => round.kanji)).toEqual(['生', '学']);
  });

  it('deletes the play log with the rest', async () => {
    await saveRun(run);
    await appendKanjiRound({ day: '2026-11-26', kanji: '生', isPerfect: true });
    await deleteAllData();
    expect([await loadRuns(), await loadKanjiRounds()]).toEqual([[], []]);
  });

  it('deletes every event, setting, best score and the haiku collection, but keeps preferences', async () => {
    localStorage.setItem('juku-arcade:haiku', '{"collected":["park"],"round":[]}');
    localStorage.setItem('juku-arcade:best-bunpou-score', '900');
    localStorage.setItem('juku-arcade:best-bank-score', '450');
    localStorage.setItem('juku-arcade:music-volume', '0.5');
    await appendGrammarEvents([sentence('o', '2026-11-24', 'wrong')]);
    await deleteAllData();
    expect([await loadEvents(), await loadGrammarEvents(), await loadSettings()]).toEqual([
      [],
      [],
      null,
    ]);
    expect(localStorage.getItem('juku-arcade:haiku')).toBeNull();
    expect(localStorage.getItem('juku-arcade:best-bunpou-score')).toBeNull();
    expect(localStorage.getItem('juku-arcade:best-bank-score')).toBeNull();
    // A preference isn't progress: the delete keeps it.
    expect(localStorage.getItem('juku-arcade:music-volume')).toBe('0.5');
  });
});
