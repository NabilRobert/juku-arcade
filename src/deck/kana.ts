/**
 * Small facts about hiragana that the decoy generators need: which kana
 * take dakuten, which vowel a kana ends in, and katakana-to-hiragana.
 *
 * OpenJLPT's readings for kanji words are hiragana, but KANJIDIC2's on-yomi
 * are katakana, so everything is compared in hiragana.
 */

const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;
const KATAKANA_START = 0x30a1; // ァ
const KATAKANA_END = 0x30f6; // ヶ

export function toHiragana(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const isKatakana = code >= KATAKANA_START && code <= KATAKANA_END;
    result += isKatakana ? String.fromCodePoint(code - KATAKANA_TO_HIRAGANA_OFFSET) : char;
  }
  return result;
}

/** Plain kana and their voiced (dakuten) partners: か → が. */
export const VOICED: Readonly<Record<string, string>> = {
  か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご',
  さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ',
  た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど',
  は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ',
}; // prettier-ignore

/** は-row kana and their handakuten partners: は → ぱ. */
export const SEMI_VOICED: Readonly<Record<string, string>> = {
  は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ',
}; // prettier-ignore

const VOWEL_ROWS: Readonly<Record<string, string>> = {
  あ: 'あかさたなはまやらわがざだばぱゃぁ',
  い: 'いきしちにひみりぎじぢびぴぃ',
  う: 'うくすつぬふむゆるぐずづぶぷゅぅ',
  え: 'えけせてねへめれげぜでべぺぇ',
  お: 'おこそとのほもよろをごぞどぼぽょぉ',
};

/** The vowel a kana ends in (き → い), or undefined for ん, っ and non-kana. */
export function vowelOf(kana: string): string | undefined {
  for (const [vowel, row] of Object.entries(VOWEL_ROWS)) {
    if (row.includes(kana)) return vowel;
  }
  return undefined;
}

/** True if `next` lengthens the vowel of `previous`: こ+う, せ+い, か+あ. */
export function isLongVowelPair(previous: string, next: string): boolean {
  const vowel = vowelOf(previous);
  if (vowel === undefined) return false;
  if (next === vowel) return true;
  return (vowel === 'お' && next === 'う') || (vowel === 'え' && next === 'い');
}

export const SMALL_YOON: Readonly<Record<string, string>> = { ゃ: 'や', ゅ: 'ゆ', ょ: 'よ' };

/** Kana that a small ゃ, ゅ or ょ can follow: き, し, ち… */
export const YOON_BASES = 'きしちにひみりぎじぢびぴ';

/** Kana that a small っ can come before (k, s, t and p rows). */
export const SOKUON_FOLLOWERS = 'かきくけこさしすせそたちつてとぱぴぷぺぽ';

/** Kana that a small っ can't come after: いっにち and せんっせい aren't Japanese. */
const NO_SOKUON_AFTER = 'んっー';

/** False for readings no word could have, because of where a small っ sits. */
export function isPronounceable(reading: string): boolean {
  const chars = [...reading];
  return chars.every((char, index) => {
    if (char !== 'っ') return true;
    const previous = chars[index - 1];
    const next = chars[index + 1];
    const hasValidPrevious = previous !== undefined && !NO_SOKUON_AFTER.includes(previous);
    return hasValidPrevious && next !== undefined && SOKUON_FOLLOWERS.includes(next);
  });
}

/** 々 repeats the kanji before it (人々 ひとびと). */
export const REPEAT_MARK = '々';
const CJK_START = 0x4e00;
const CJK_END = 0x9fff;

export function isKanji(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return char === REPEAT_MARK || (code >= CJK_START && code <= CJK_END);
}
