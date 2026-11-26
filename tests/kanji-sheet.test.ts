import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import type { KanjiRound } from '../src/kanji/kanji-round.ts';
import type { PlayedRound } from '../src/kanji/useKanjiRun.ts';
import { LANTERNS, lanternsAfter } from '../src/game/lanterns.ts';
import { KANJI_PER_SHEET, useKanjiSheet } from '../src/kanji/useKanjiSheet.ts';

const round = (kanji: string): KanjiRound => ({ kanji, meanings: [], cards: [] });
const result = (isPerfect: boolean, misses = 0): PlayedRound => ({
  hits: 1,
  wrongPicks: isPerfect ? 0 : 1,
  misses,
  isPerfect,
  points: 10,
  crestPoints: 0,
});

const sheetSource = () => ({
  round: ref(round('生')),
  roundNumber: ref(1),
  score: ref(0),
  lastResult: ref<PlayedRound | null>(null),
});

describe('a kanji sheet', () => {
  it('ends once the last kanji has been played and the next would be dealt', async () => {
    const source = {
      round: ref(round('生')),
      roundNumber: ref(1),
      score: ref(0),
      lastResult: ref<PlayedRound | null>(null),
    };
    const sheet = useKanjiSheet(source);
    for (let kanji = 1; kanji <= KANJI_PER_SHEET; kanji += 1) {
      expect(sheet.isDone.value).toBe(false);
      source.lastResult.value = result(kanji % 2 === 0);
      await nextTick();
      source.roundNumber.value += 1;
    }
    expect(sheet.isDone.value).toBe(true);
    expect(sheet.tally.value).toEqual({ answered: KANJI_PER_SHEET, right: KANJI_PER_SHEET / 2 });
    expect(sheet.kanjiNumber.value).toBe(KANJI_PER_SHEET);
  });
});

describe("a kanji sheet's lanterns (D72)", () => {
  it('puts one out for a kanji left with readings unfound, but not for wrong picks alone', async () => {
    const source = sheetSource();
    const sheet = useKanjiSheet(source);
    source.lastResult.value = result(false, 0);
    await nextTick();
    expect(sheet.lanterns.value).toBe(LANTERNS);
    source.lastResult.value = result(false, 1);
    await nextTick();
    expect(sheet.lanterns.value).toBe(LANTERNS - 1);
  });

  it('ends the sheet early once the last lantern is out', async () => {
    const source = sheetSource();
    const sheet = useKanjiSheet(source);
    for (let failed = 1; failed <= LANTERNS; failed += 1) {
      expect(sheet.isDone.value).toBe(false);
      source.lastResult.value = result(false, 1);
      await nextTick();
      source.roundNumber.value += 1;
    }
    expect([sheet.isDone.value, sheet.isOutOfLanterns.value]).toEqual([true, true]);
  });
});

describe('a lantern going out', () => {
  it('goes out for a failed answer, never below none, and stays lit otherwise', () => {
    expect(lanternsAfter(3, true)).toBe(2);
    expect(lanternsAfter(3, false)).toBe(3);
    expect(lanternsAfter(0, true)).toBe(0);
  });
});
