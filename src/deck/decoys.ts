/**
 * Decoy readings that each test one kind of mistake (R8, D27).
 *
 * Each function takes a word's real reading and returns every near-miss of
 * its kind, in reading order. がっこう gives がっこ (long vowel), がこう
 * (small っ) and so on. The deck script keeps the first one that isn't
 * itself a valid reading of the word. The "other reading" decoy needs kanji
 * data, so it lives in readings.ts.
 */
import {
  isLongVowelPair,
  SEMI_VOICED,
  SMALL_YOON,
  SOKUON_FOLLOWERS,
  VOICED,
  vowelOf,
  YOON_BASES,
} from './kana.ts';

function replaceAt(chars: string[], index: number, replacement: string): string {
  return [...chars.slice(0, index), replacement, ...chars.slice(index + 1)].join('');
}

/** Shorten a long vowel (がっこう → がっこ), or lengthen a short one (ここ → こうこ). */
export function longVowelDecoys(reading: string): string[] {
  const chars = [...reading];
  const shortened: string[] = [];
  const lengthened: string[] = [];
  chars.forEach((char, index) => {
    const previous = chars[index - 1];
    const isLengthener =
      char === 'ー' || (previous !== undefined && isLongVowelPair(previous, char));
    if (isLengthener) shortened.push(replaceAt(chars, index, ''));
    const next = chars[index + 1];
    const isShortO = vowelOf(char) === 'お' && next !== 'う' && next !== 'お';
    if (isShortO) lengthened.push(replaceAt(chars, index, `${char}う`));
  });
  return [...shortened, ...lengthened];
}

/** Drop a small っ (がっこう → がこう), or add one (いて → いって). */
export function smallTsuDecoys(reading: string): string[] {
  const chars = [...reading];
  const dropped: string[] = [];
  const added: string[] = [];
  chars.forEach((char, index) => {
    if (char === 'っ') dropped.push(replaceAt(chars, index, ''));
    const canAddBefore = index > 0 && SOKUON_FOLLOWERS.includes(char) && chars[index - 1] !== 'っ';
    if (canAddBefore) added.push(replaceAt(chars, index, `っ${char}`));
  });
  return [...dropped, ...added];
}

function findUnvoiced(voiced: string): string | undefined {
  const all = { ...VOICED, ...SEMI_VOICED };
  return Object.keys(all).find((plain) => all[plain] === voiced);
}

/** Add or remove dakuten or handakuten on one kana: はし → ばし, ぱし; かぎ → かき. */
export function dakutenDecoys(reading: string): string[] {
  const chars = [...reading];
  const decoys: string[] = [];
  chars.forEach((char, index) => {
    for (const partner of [VOICED[char], SEMI_VOICED[char], findUnvoiced(char)]) {
      if (partner !== undefined) decoys.push(replaceAt(chars, index, partner));
    }
  });
  return decoys;
}

/** Make a small ゃゅょ full size (きょう → きよう), or a full-size one small (きや → きゃ). */
export function smallYoonDecoys(reading: string): string[] {
  const chars = [...reading];
  const decoys: string[] = [];
  chars.forEach((char, index) => {
    const fullSize = SMALL_YOON[char];
    if (fullSize !== undefined) decoys.push(replaceAt(chars, index, fullSize));
    const small = Object.keys(SMALL_YOON).find((key) => SMALL_YOON[key] === char);
    const previous = chars[index - 1];
    const followsYoonBase = previous !== undefined && YOON_BASES.includes(previous);
    if (small !== undefined && followsYoonBase) decoys.push(replaceAt(chars, index, small));
  });
  return decoys;
}
