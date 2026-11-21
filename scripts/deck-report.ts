/**
 * Slice 0's spike report: how many words per level can go in a deck, how
 * often the irregular-reading check can decide, and how many decoys of each
 * type every level can supply. `npm run decks:report` prints it as Markdown.
 */
import { isIrregularReading } from '../src/deck/readings.ts';
import { DECOY_TYPES, JLPT_LEVELS, type DeckWord } from '../src/deck/types.ts';
import type { KanjiRow, VocabRow } from './openjlpt.ts';

const SAMPLE_SIZE = 8;

function percent(part: number, whole: number): string {
  return whole === 0 ? '–' : `${Math.round((part / whole) * 100)}%`;
}

function irregularCounts(rows: VocabRow[], kanjiTable: ReadonlyMap<string, KanjiRow>) {
  const verdicts = rows.map((row) => isIrregularReading(row.word, row.reading, kanjiTable));
  return {
    irregular: verdicts.filter((verdict) => verdict === true).length,
    unknown: verdicts.filter((verdict) => verdict === null).length,
    samples: rows.filter((_, index) => verdicts[index] === true).slice(0, SAMPLE_SIZE),
  };
}

function sharedReadingCount(words: DeckWord[]): number {
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word.reading, (counts.get(word.reading) ?? 0) + 1);
  return words.filter((word) => (counts.get(word.reading) ?? 0) > 1).length;
}

function levelRow(
  level: string,
  rows: VocabRow[],
  words: DeckWord[],
  kanjiTable: ReadonlyMap<string, KanjiRow>,
) {
  const levelRows = rows.filter((row) => row.level === level);
  const levelWords = words.filter((word) => levelRows.some((row) => row.id === word.id));
  const kanjiRows = levelRows.filter((row) => levelWords.some((word) => word.id === row.id));
  const { irregular, unknown } = irregularCounts(kanjiRows, kanjiTable);
  const decoyCells = DECOY_TYPES.map((type) =>
    percent(levelWords.filter((word) => word.decoys[type] !== undefined).length, levelWords.length),
  );
  const cells = [level, levelRows.length, levelWords.length, sharedReadingCount(levelWords)];
  return `| ${[...cells, irregular, unknown, ...decoyCells].join(' | ')} |`;
}

export function deckReport(
  rows: VocabRow[],
  words: DeckWord[],
  kanjiTable: ReadonlyMap<string, KanjiRow>,
): string {
  const header = [
    'Level',
    'Words',
    'Usable (has kanji)',
    'Share a reading',
    'Irregular',
    'Unknown',
    ...DECOY_TYPES,
  ];
  const n5Rows = rows.filter(
    (row) => row.level === 'N5' && words.some((word) => word.id === row.id),
  );
  const irregularSamples = irregularCounts(n5Rows, kanjiTable).samples;
  const decoySamples = words.slice(0, SAMPLE_SIZE);
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...JLPT_LEVELS.map((level) => levelRow(level, rows, words, kanjiTable)),
    '',
    `Irregular at N5 (sample): ${irregularSamples.map((row) => `${row.word} ${row.reading}`).join(', ')}`,
    '',
    'Decoys (sample):',
    ...decoySamples.map((word) => `- ${word.word} ${word.reading}: ${JSON.stringify(word.decoys)}`),
  ].join('\n');
}
