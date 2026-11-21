/**
 * Readings a word *could* have, built from its kanji's readings.
 *
 * 学校 is 学 (がく) + 校 (こう). With the usual sound changes, that gives
 * がくこう, がっこう… This answers two questions for the deck script:
 * - is the real reading irregular, meaning none of the combinations make it
 *   (今日 きょう, 大人 おとな)? That feeds the difficulty guess (R5);
 * - what is the closest wrong combination? That's the "same kanji, other
 *   reading" decoy (R8).
 */
import { distance } from 'fastest-levenshtein';
import { isPronounceable, SEMI_VOICED, toHiragana, VOICED } from './kana.ts';

export interface KanjiReadings {
  onyomi: string[];
  kunyomi: string[];
}

/** Combinations beyond this are skipped, so long words don't explode. */
export const MAX_CANDIDATES = 5000;

const REPEAT_MARK = '々';
const CJK_START = 0x4e00;
const CJK_END = 0x9fff;
const SOKUON_ENDINGS = 'きくちつ';

export function isKanji(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return char === REPEAT_MARK || (code >= CJK_START && code <= CJK_END);
}

/** A verb ending's stem form, used inside compounds: 入る → 入り (いりぐち). */
const STEM_FORM: Readonly<Record<string, string>> = {
  う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り',
}; // prettier-ignore

/**
 * A kun-yomi like い.る gives い, the kanji's own part. Where no kana follow
 * the kanji in the word, it also gives いり, the stem form: 入口 いりぐち,
 * 話 はなし. Before kana (座る) the word spells its own ending, so the stem
 * form would double it (すわりる).
 */
function kunyomiForms(kun: string, allowsStemForm: boolean): string[] {
  const [stem = '', okurigana = ''] = kun.replaceAll('-', '').split('.');
  const stemForm = STEM_FORM[okurigana.at(-1) ?? ''];
  if (!allowsStemForm || stemForm === undefined) return [stem];
  return [stem, stem + okurigana.slice(0, -1) + stemForm];
}

/** A kanji's readings in hiragana: its on-yomi, and its kun-yomi forms. */
export function readingOptions(kanji: KanjiReadings, allowsStemForm = true): string[] {
  const onyomi = kanji.onyomi.map(toHiragana);
  const kunyomi = kanji.kunyomi.flatMap((kun) => kunyomiForms(kun, allowsStemForm));
  return [...new Set([...onyomi, ...kunyomi].filter((option) => option !== ''))];
}

/** One reading plus its sound-changed forms: rendaku (こう → ごう) and sokuon (がく → がっ). */
function withSoundChanges(option: string, isFirst: boolean, isLast: boolean): string[] {
  const forms = [option];
  const first = option[0] ?? '';
  if (!isFirst) {
    for (const changed of [VOICED[first], SEMI_VOICED[first]]) {
      if (changed !== undefined) forms.push(changed + option.slice(1));
    }
  }
  const last = option.at(-1) ?? '';
  if (!isLast && SOKUON_ENDINGS.includes(last)) forms.push(`${option.slice(0, -1)}っ`);
  return forms;
}

/** Each character's possible readings: kana stay as they are, kanji get their options. */
function charOptions(
  word: string,
  kanjiTable: ReadonlyMap<string, KanjiReadings>,
): string[][] | null {
  const chars = [...word];
  const options: string[][] = [];
  for (const [index, char] of chars.entries()) {
    if (!isKanji(char)) {
      options.push([toHiragana(char)]);
      continue;
    }
    const source = char === REPEAT_MARK ? chars[index - 1] : char;
    const kanji = source === undefined ? undefined : kanjiTable.get(source);
    if (kanji === undefined) return null;
    const next = chars[index + 1];
    const isLast = next === undefined;
    const allowsStemForm = isLast || isKanji(next);
    options.push(
      readingOptions(kanji, allowsStemForm).flatMap((option) =>
        withSoundChanges(option, index === 0, isLast),
      ),
    );
  }
  return options;
}

/** Every reading the kanji's readings can combine into, or null if unknown or too many. */
export function candidateReadings(
  word: string,
  kanjiTable: ReadonlyMap<string, KanjiReadings>,
): Set<string> | null {
  const options = charOptions(word, kanjiTable);
  if (options === null) return null;
  let partials = [''];
  for (const choices of options) {
    if (partials.length * choices.length > MAX_CANDIDATES) return null;
    partials = partials.flatMap((partial) => choices.map((choice) => partial + choice));
  }
  return new Set(partials);
}

/** True if no combination of the kanji's readings gives the real reading; null if unknown. */
export function isIrregularReading(
  word: string,
  reading: string,
  kanjiTable: ReadonlyMap<string, KanjiReadings>,
): boolean | null {
  const candidates = candidateReadings(word, kanjiTable);
  return candidates === null ? null : !candidates.has(reading);
}

/** A decoy much longer or shorter than the real reading gives itself away. */
const MAX_DECOY_LENGTH_DIFFERENCE = 1;

/** The wrong combination closest to the real reading: 学校 がっこう → がくこう. */
export function otherReadingDecoy(
  word: string,
  validReadings: readonly string[],
  kanjiTable: ReadonlyMap<string, KanjiReadings>,
): string | undefined {
  const [reading] = validReadings;
  const candidates = candidateReadings(word, kanjiTable);
  if (reading === undefined || candidates === null) return undefined;
  const isSimilarLength = (candidate: string): boolean =>
    Math.abs(candidate.length - reading.length) <= MAX_DECOY_LENGTH_DIFFERENCE;
  const wrong = [...candidates].filter(
    (candidate) =>
      !validReadings.includes(candidate) &&
      isSimilarLength(candidate) &&
      isPronounceable(candidate),
  );
  const byCloseness = (a: string, b: string): number =>
    distance(a, reading) - distance(b, reading) || a.localeCompare(b);
  return wrong.sort(byCloseness)[0];
}
