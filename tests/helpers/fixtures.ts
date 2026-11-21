// Shared test data: a seeded random source and a small kanji table.
import type { KanjiRow } from '../../scripts/openjlpt.ts';
import type { DeckWord } from '../../src/deck/types.ts';

/** Mulberry32: a tiny seeded generator, so shuffles repeat exactly in tests. */
export function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function kanji(onyomi: string[], kunyomi: string[], frequencyRank: number | null): KanjiRow {
  return { onyomi, kunyomi, frequencyRank, meanings: [], words: [] };
}

/** Readings as KANJIDIC2 gives them (on-yomi in katakana, kun-yomi with okurigana dots). */
export const KANJI_TABLE = new Map<string, KanjiRow>([
  ['学', kanji(['ガク'], ['まな.ぶ'], 63)],
  ['校', kanji(['コウ', 'キョウ'], [], 294)],
  ['今', kanji(['コン', 'キン'], ['いま'], 49)],
  ['日', kanji(['ニチ', 'ジツ'], ['ひ', '-び', '-か'], 1)],
  ['入', kanji(['ニュウ', 'ジュ'], ['い.る', 'はい.る'], 56)],
  ['口', kanji(['コウ', 'ク'], ['くち'], 284)],
  ['人', kanji(['ジン', 'ニン'], ['ひと', '-り', '-と'], 5)],
]);

export function deckWord(
  id: string,
  word: string,
  reading: string,
  otherReadings: string[] = [],
): DeckWord {
  return {
    id,
    word,
    reading,
    otherReadings,
    missChanceGuess: 0.2,
    decoys: { longVowel: `${reading}う`, dakuten: `が${reading}` },
    meanings: [`meaning of ${word}`],
    example: null,
    kanjiReadingsUsed: {},
  };
}
