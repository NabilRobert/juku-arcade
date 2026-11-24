/**
 * Prints generated tales for a person to read (`npm run grammar:preview`),
 * the G0 spike's output: is the generated Japanese good enough to build
 * the mode on? Each line shows the sentence, its furigana, its tiles as
 * the player would get them (shuffled), and the grammar point it tests.
 *
 * Seeded, so the same command prints the same tales:
 * `npm run grammar:preview -- --tales=50 --seed=1`.
 */
import { seededRandom } from '../src/game/random.ts';
import { shuffled } from '../src/game/deal.ts';
import { sentenceText, type Sentence } from '../src/grammar/fill.ts';
import { makeTale, type Tale } from '../src/grammar/tale.ts';
import { TEMPLATES } from '../src/grammar/templates.ts';

const DEFAULT_TALES = 50;
const DEFAULT_SEED = 1;
const PART_NAMES = { S: '起', D: '承', T: '転', P: '結' } as const;

function numberOption(name: string, fallback: number): number {
  const option = process.argv.find((argument) => argument.startsWith(`--${name}=`));
  if (option === undefined) return fallback;
  const value = Number(option.split('=')[1]);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`--${name} must be a whole number above 0, like --${name}=${fallback}`);
  }
  return value;
}

/** {先生|せんせい}は → 先生(せんせい)は, easier to read in a terminal than ruby markup. */
const readableFurigana = (marked: string): string =>
  marked.replace(/\{([^|{}]+)\|([^{}]+)\}/g, '$1($2)');

function describeLine(sentence: Sentence, random: () => number): string {
  const tiles = shuffled(
    sentence.tiles.map((tile) => tile.text),
    random,
  ).join(' / ');
  const furigana = sentence.tiles.map((tile) => readableFurigana(tile.marked)).join('');
  const swaps = sentence.swaps.map(([first, second]) => `also right with ${first}↔${second}`);
  return [
    `  ${PART_NAMES[sentence.shelf]} ${sentenceText(sentence)}  [${sentence.point}, ${sentence.templateId}]`,
    `     ${furigana}`,
    `     tiles: ${tiles}${swaps.length > 0 ? `  (${swaps.join(', ')})` : ''}`,
  ].join('\n');
}

function describeTale(tale: Tale, number: number, random: () => number): string {
  const { who, who2, place, place2, food, thing, time } = tale.setting;
  const cast = `${who.word}, ${who2.word} · ${place.word}, ${place2.word} · ${food.word} · ${thing.word} · ${time.word}`;
  const lines = tale.lines.map((sentence) => describeLine(sentence, random));
  return [`Tale ${number} (${tale.lines.length} lines; ${cast})`, ...lines].join('\n');
}

const taleCount = numberOption('tales', DEFAULT_TALES);
const random = seededRandom(numberOption('seed', DEFAULT_SEED));
const points = [...new Set(TEMPLATES.map((template) => template.point))];
console.log(`${taleCount} tales from ${TEMPLATES.length} templates on ${points.join(', ')}\n`);
for (let number = 1; number <= taleCount; number++) {
  console.log(`${describeTale(makeTale(points, TEMPLATES, random), number, random)}\n`);
}
