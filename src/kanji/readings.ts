/**
 * Kanji readings as kanji mode shows them (D37). The decks write readings
 * the way kanji dictionaries do: on-readings in katakana (ガク), kun-readings
 * in hiragana with a dot before the okurigana (まな.ぶ), and a hyphen for a
 * prefix or suffix (-び). A card shows まな(ぶ): the okurigana in brackets,
 * no hyphens. Two spellings that read the same (うまれ and う.まれ) count
 * as one reading.
 */
import type { DeckWord, KanjiNote } from '../deck/types.ts';

export interface KanjiReading {
  /** What the card shows: まな(ぶ), ガク. */
  shown: string;
  /** The kana alone, to compare readings: まなぶ. */
  plain: string;
}

/** Turns a dictionary reading into the card's reading. */
export function toKanjiReading(raw: string): KanjiReading {
  const bare = raw.replaceAll('-', '');
  const [stem = '', okurigana = ''] = bare.split('.');
  return { shown: okurigana === '' ? stem : `${stem}(${okurigana})`, plain: stem + okurigana };
}

/** Keeps the first spelling of each reading, preferring one that shows its okurigana. */
function addReading(readings: Map<string, KanjiReading>, reading: KanjiReading): void {
  const existing = readings.get(reading.plain);
  const showsMore = existing !== undefined && reading.shown.length > existing.shown.length;
  if (existing === undefined || showsMore) readings.set(reading.plain, reading);
}

/**
 * The readings each kanji has in this level's words, by kanji: the
 * readings learners meet, rather than every reading in the dictionary.
 */
export function readingsUsedByKanji(words: readonly DeckWord[]): Map<string, KanjiReading[]> {
  const byKanji = new Map<string, Map<string, KanjiReading>>();
  for (const word of words) {
    for (const [kanji, raws] of Object.entries(word.kanjiReadingsUsed)) {
      const readings = byKanji.get(kanji) ?? new Map<string, KanjiReading>();
      for (const raw of raws) addReading(readings, toKanjiReading(raw));
      byKanji.set(kanji, readings);
    }
  }
  return new Map([...byKanji].map(([kanji, readings]) => [kanji, [...readings.values()]]));
}

/** Every reading the dictionary lists for a kanji, as kana, so a decoy is never secretly right. */
export function allReadingsOf(note: KanjiNote): Set<string> {
  return new Set([...note.onyomi, ...note.kunyomi].map((raw) => toKanjiReading(raw).plain));
}
