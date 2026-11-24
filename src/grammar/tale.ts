/**
 * The matcher (D55): builds one tale of 4–6 lines in the shape
 * 起承転結 from the templates.
 *
 * 1. Pick the setting: two characters, two places, a food, a thing and a
 *    time, shared by every line.
 * 2. Take the grammar points the player has today (the caller's list).
 * 3. Roll the length (4, 5 or 6) and which shelves take a second line.
 * 4. Pick one template per line from the right shelf, a different grammar
 *    point on every line; a second line must be a follow-on template.
 * 5. Fill each one (fill.ts).
 *
 * If the roll doesn't fit the points and templates (too few points for 6
 * lines, say), it rolls again; after MAX_ATTEMPTS it gives up with an
 * error that names the points.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import { fillTemplate, SLOT_TYPES, type Sentence, type Setting, type Slot } from './fill.ts';
import { NOUNS, type Noun } from './lexicon.ts';
import type { Shelf, Template } from './templates.ts';

/** 起 setup, 承 development, 転 twist, 結 punchline: the order every tale tells them in. */
export const SHELF_ORDER: readonly Shelf[] = ['S', 'D', 'T', 'P'];
/** Up to two shelves take a second line, so a tale has 4, 5 or 6 lines. */
const MAX_SECOND_LINES = 2;
/** Rolls tried before deciding the points can't make a tale; far more than a good pool needs. */
const MAX_ATTEMPTS = 200;

export interface Tale {
  setting: Setting;
  lines: Sentence[];
}

/** One line's place in the tale: its shelf, and whether it's that shelf's second line. */
interface LinePlan {
  shelf: Shelf;
  isSecond: boolean;
}

function pickNouns(type: Noun['type'], count: number, random: RandomSource): Noun[] {
  const picked = shuffled(
    NOUNS.filter((noun) => noun.type === type),
    random,
  ).slice(0, count);
  if (picked.length < count) throw new Error(`lexicon.ts needs at least ${count} ${type} nouns`);
  return picked;
}

/** Matcher step 1. Slots of the same type (who, who2) always get different words. */
export function pickSetting(random: RandomSource): Setting {
  const slots = Object.keys(SLOT_TYPES) as Slot[];
  const setting: Partial<Setting> = {};
  for (const type of new Set(Object.values(SLOT_TYPES))) {
    const slotsOfType = slots.filter((slot) => SLOT_TYPES[slot] === type);
    const nouns = pickNouns(type, slotsOfType.length, random);
    for (const [index, slot] of slotsOfType.entries()) setting[slot] = nouns[index];
  }
  return setting as Setting;
}

/** Matcher step 3. */
function rollPlan(random: RandomSource): LinePlan[] {
  const secondLines = Math.floor(random() * (MAX_SECOND_LINES + 1));
  const doubled = new Set(shuffled(SHELF_ORDER, random).slice(0, secondLines));
  return SHELF_ORDER.flatMap((shelf) => {
    const first: LinePlan = { shelf, isSecond: false };
    return doubled.has(shelf) ? [first, { shelf, isSecond: true }] : [first];
  });
}

/** Matcher step 4: a template per line, each on a grammar point not used yet, or null. */
function pickTemplates(
  plan: readonly LinePlan[],
  points: ReadonlySet<string>,
  templates: readonly Template[],
  random: RandomSource,
): Template[] | null {
  const usedPoints = new Set<string>();
  const picked: Template[] = [];
  for (const line of plan) {
    const candidates = templates.filter(
      (template) =>
        template.shelf === line.shelf &&
        (template.followOn ?? false) === line.isSecond &&
        points.has(template.point) &&
        !usedPoints.has(template.point),
    );
    const [choice] = shuffled(candidates, random);
    if (choice === undefined) return null;
    usedPoints.add(choice.point);
    picked.push(choice);
  }
  return picked;
}

function fillAll(templates: readonly Template[], setting: Setting): Sentence[] | null {
  const lines: Sentence[] = [];
  for (const template of templates) {
    const sentence = fillTemplate(template, setting);
    if (sentence === null) return null;
    lines.push(sentence);
  }
  return lines;
}

export function makeTale(
  points: readonly string[],
  templates: readonly Template[],
  random: RandomSource,
): Tale {
  const pointSet = new Set(points);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const setting = pickSetting(random);
    const picked = pickTemplates(rollPlan(random), pointSet, templates, random);
    const lines = picked === null ? null : fillAll(picked, setting);
    if (lines !== null) return { setting, lines };
  }
  throw new Error(
    `No tale fits the grammar points ${points.join(', ')}: every shelf (S, D, T, P) needs a ` +
      'template on one of them. Add templates, or more points.',
  );
}
