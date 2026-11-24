/**
 * Whether readings show over kanji (FuriganaText): in Bunpou and on the
 * back of word cards. On by default; a switch in Settings turns it off
 * for players who want to read without them. Kanji mode never shows
 * furigana, as reading the kanji is its exercise.
 */
import { storedFlag } from './stored-flag.ts';

const furigana = storedFlag('juku-arcade:furigana', true);
export const isFuriganaShown = furigana.isOn;
export const setFuriganaShown = furigana.set;
