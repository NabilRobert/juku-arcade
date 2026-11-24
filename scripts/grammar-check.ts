/**
 * The grammar mode's build check (`npm run grammar:check`):
 * - the templates against the shelf map (src/grammar/template-check.ts);
 * - every word in src/grammar/lexicon.ts against the pinned OpenJLPT
 *   build: an N5 word, with that reading, and for verbs that class.
 * Exits with code 1 and lists the problems if there are any.
 *
 * The shelf map, bunpou-n5-shelf-map.csv, isn't committed yet: it's read
 * from the repo root until a copy is.
 */
import { readFileSync } from 'node:fs';
import type { DatabaseSync } from 'node:sqlite';
import { NOUNS, VERBS } from '../src/grammar/lexicon.ts';
import { parseShelfMap, templateProblems } from '../src/grammar/template-check.ts';
import { TEMPLATES } from '../src/grammar/templates.ts';
import { openPinnedDatabase } from './openjlpt.ts';

const SHELF_MAP_PATH = 'bunpou-n5-shelf-map.csv';

interface N5Entry {
  reading: string;
  pos: string[];
}

function readN5Words(database: DatabaseSync): Map<string, N5Entry[]> {
  const rows = database.prepare("SELECT word, reading, pos FROM vocab WHERE level = 'N5'").all();
  const byWord = new Map<string, N5Entry[]>();
  for (const row of rows) {
    const entry = { reading: String(row.reading), pos: JSON.parse(String(row.pos)) as string[] };
    byWord.set(String(row.word), [...(byWord.get(String(row.word)) ?? []), entry]);
  }
  return byWord;
}

function lexiconProblems(n5Words: ReadonlyMap<string, N5Entry[]>): string[] {
  const problems: string[] = [];
  const words = [...NOUNS, ...VERBS.map((verb) => ({ ...verb, type: 'verb' }))];
  for (const word of words) {
    const entries = n5Words.get(word.word) ?? [];
    const sameReading = entries.find((entry) => entry.reading === word.reading);
    if (sameReading === undefined) {
      problems.push(`lexicon: ${word.word} (${word.reading}) isn't an N5 word with that reading`);
    } else if ('verbClass' in word && !sameReading.pos.includes(word.verbClass)) {
      problems.push(
        `lexicon: ${word.word} is ${sameReading.pos.join(', ')}, not ${word.verbClass}`,
      );
    }
  }
  return problems;
}

const shelfMap = parseShelfMap(readFileSync(SHELF_MAP_PATH, 'utf8'));
const database = await openPinnedDatabase();
const problems = [
  ...templateProblems(TEMPLATES, shelfMap),
  ...lexiconProblems(readN5Words(database)),
];
database.close();

if (problems.length > 0) {
  console.error(`The grammar content has ${problems.length} problem(s):\n${problems.join('\n')}`);
  process.exit(1);
}
const points = new Set(TEMPLATES.map((template) => template.point)).size;
console.log(
  `Grammar content OK: ${TEMPLATES.length} templates on ${points} points, ` +
    `${NOUNS.length} nouns and ${VERBS.length} verbs, all N5.`,
);
