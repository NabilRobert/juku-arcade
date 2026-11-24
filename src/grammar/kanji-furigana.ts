/**
 * Furigana on the kanji only (D55): OpenJLPT's readings
 * cover a whole word (起きます, おきます), so the kana the word and its
 * reading share are lined up and left bare: {起|お}きます, お{母|かあ}さん.
 *
 * The result is the {kanji|reading} markup that src/deck/furigana.ts:
 * parseFurigana already reads.
 */
import { isKanji } from '../deck/kana.ts';

/** Splits a word into runs of kanji and runs of everything else: お母さん → お, 母, さん. */
function kanjiRuns(word: string): string[] {
  const runs: string[] = [];
  let previousIsKanji: boolean | null = null;
  for (const char of word) {
    const charIsKanji = isKanji(char);
    if (charIsKanji === previousIsKanji) runs[runs.length - 1] += char;
    else runs.push(char);
    previousIsKanji = charIsKanji;
  }
  return runs;
}

const escapeForRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function kanjiFurigana(word: string, reading: string): string {
  if (![...word].some(isKanji)) return word;
  const runs = kanjiRuns(word);
  // Each kanji run reads as some kana; every other run must appear as it is.
  const pattern = runs.map((run) => (isKanji(run[0] ?? '') ? '(.+?)' : escapeForRegex(run)));
  const match = new RegExp(`^${pattern.join('')}$`, 'u').exec(reading);
  // An irregular reading that won't line up gets furigana over the whole word.
  if (match === null) return `{${word}|${reading}}`;
  let group = 1;
  return runs
    .map((run) => {
      if (!isKanji(run[0] ?? '')) return run;
      const runReading = match[group] ?? '';
      group += 1;
      return `{${run}|${runReading}}`;
    })
    .join('');
}
