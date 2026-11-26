/**
 * The kanji table each deck carries for the card's back (D29): every kanji
 * its words use, with all its readings, meanings, and a few other JLPT
 * words that use it.
 */
import { isKanji } from '../src/deck/kana.ts';
import type { DeckWord, KanjiNote } from '../src/deck/types.ts';
import type { KanjiRow, VocabRow } from './openjlpt.ts';

/** Enough examples to show a kanji's other readings without crowding the card. */
const MAX_OTHER_WORDS = 4;

export function kanjiNotesFor(
  words: readonly DeckWord[],
  kanjiTable: ReadonlyMap<string, KanjiRow>,
  allVocab: readonly VocabRow[],
): Record<string, KanjiNote> {
  const readingBySpelling = new Map(allVocab.map((row) => [row.word, row.reading]));
  const notes: Record<string, KanjiNote> = {};
  for (const char of new Set(words.flatMap((word) => [...word.word].filter(isKanji)))) {
    const kanji = kanjiTable.get(char);
    if (kanji === undefined) continue;
    const otherWords = kanji.words
      .filter((spelling) => readingBySpelling.has(spelling))
      .slice(0, MAX_OTHER_WORDS + 1)
      .map((spelling) => ({ word: spelling, reading: readingBySpelling.get(spelling) ?? '' }));
    notes[char] = {
      onyomi: kanji.onyomi,
      kunyomi: kanji.kunyomi,
      meanings: kanji.meanings,
      words: otherWords,
      listLevel: kanji.listLevel,
    };
  }
  return notes;
}
