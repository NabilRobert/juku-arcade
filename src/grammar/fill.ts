/**
 * Fills one template from a tale's setting (matcher steps 5 and 7): drops
 * in the setting's words, conjugates the verb, adds furigana on the kanji
 * and keeps the template's tiles and units for the order checker.
 */
import { conjugatePolite, isPoliteForm } from './conjugate.ts';
import { kanjiFurigana } from './kanji-furigana.ts';
import { verbByWord, type Noun } from './lexicon.ts';
import type { OrderRules } from './order-check.ts';
import type { PointId, Shelf, Template } from './templates.ts';

/** The slots a template can use, and the noun type that fills each. */
export const SLOT_TYPES = {
  who: 'person',
  who2: 'person',
  place: 'place',
  place2: 'place',
  food: 'food',
  thing: 'thing',
  time: 'time',
} as const;

export type Slot = keyof typeof SLOT_TYPES;

/** The cast, places and objects every line of one tale shares (matcher step 1). */
export type Setting = Record<Slot, Noun>;

export interface Tile {
  /** What the tile shows: 日曜日. */
  text: string;
  /** The same with furigana markup on its kanji, for parseFurigana: {日曜日|にちようび}. */
  marked: string;
}

export interface Sentence extends OrderRules {
  templateId: string;
  point: PointId;
  shelf: Shelf;
  /** The tiles in the template's own (right) order. */
  tiles: Tile[];
}

/** <who>, <食べる:mashita>, or {毎朝|まいあさ}: a slot, a verb, or fixed text with furigana. */
const TOKEN = /<([^<>:]+)(?::([^<>]+))?>|\{([^|{}]+)\|([^{}]+)\}/g;

function isSlot(name: string): name is Slot {
  return name in SLOT_TYPES;
}

/** One token as a word with its reading. */
function tokenWord(match: RegExpMatchArray, setting: Setting): { word: string; reading: string } {
  const [, name, form, fixedText, fixedReading] = match;
  if (fixedText !== undefined) return { word: fixedText, reading: fixedReading ?? '' };
  if (name === undefined) throw new Error(`Unreadable template token ${match[0]}`);
  if (form !== undefined) {
    if (!isPoliteForm(form)) {
      throw new Error(
        `Unknown verb form "${form}" in ${match[0]}: use masu, mashita, masen or masenDeshita`,
      );
    }
    return conjugatePolite(verbByWord(name), form);
  }
  if (!isSlot(name)) {
    throw new Error(`Unknown template slot <${name}>: use one of fill.ts SLOT_TYPES`);
  }
  return setting[name];
}

export function fillTile(pattern: string, setting: Setting): Tile {
  let text = '';
  let marked = '';
  let position = 0;
  for (const match of pattern.matchAll(TOKEN)) {
    const literal = pattern.slice(position, match.index);
    const { word, reading } = tokenWord(match, setting);
    text += literal + word;
    marked += literal + kanjiFurigana(word, reading);
    position = match.index + match[0].length;
  }
  const rest = pattern.slice(position);
  return { text: text + rest, marked: marked + rest };
}

/** The filled sentence, or null when two of its tiles would read the same. */
export function fillTemplate(template: Template, setting: Setting): Sentence | null {
  const units = template.units.map((unit) => unit.map((pattern) => fillTile(pattern, setting)));
  const tiles = units.flat();
  const texts = new Set(tiles.map((tile) => tile.text));
  if (texts.size < tiles.length) return null;
  return {
    templateId: template.id,
    point: template.point,
    shelf: template.shelf,
    tiles,
    units: units.map((unit) => unit.map((tile) => tile.text)),
    fixedUnits: template.fixedUnits ?? [],
    swaps: template.swaps ?? [],
  };
}

/** The sentence as one line of text, in the template's order: 先生は日曜日に来ます。 */
export function sentenceText(sentence: Sentence): string {
  return `${sentence.tiles.map((tile) => tile.text).join('')}。`;
}

/** One of the sentence's tiles, found by its text, with its furigana markup ({先生|せんせい}). */
export function markedTile(sentence: Sentence, text: string): string {
  return sentence.tiles.find((tile) => tile.text === text)?.marked ?? text;
}

/** The sentence with furigana markup, in the template's order or the tile order given, ending 。 */
export function markedSentence(
  sentence: Sentence,
  order: readonly string[] = sentence.tiles.map((tile) => tile.text),
): string {
  return `${order.map((text) => markedTile(sentence, text)).join('')}。`;
}
