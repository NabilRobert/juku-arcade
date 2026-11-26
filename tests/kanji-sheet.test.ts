import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import type { KanjiRound } from '../src/kanji/kanji-round.ts';
import type { PlayedRound } from '../src/kanji/useKanjiRun.ts';
import { KANJI_PER_SHEET, useKanjiSheet } from '../src/kanji/useKanjiSheet.ts';

const round = (kanji: string): KanjiRound => ({ kanji, meanings: [], cards: [] });
const result = (isPerfect: boolean): PlayedRound => ({
  hits: 1,
  wrongPicks: isPerfect ? 0 : 1,
  misses: 0,
  isPerfect,
  points: 10,
  crestPoints: 0,
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
