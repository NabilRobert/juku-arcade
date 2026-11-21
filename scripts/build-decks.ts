/**
 * Builds public/decks/<level>.json from the pinned OpenJLPT build (D15).
 *
 * Run by `npm run dev` and `npm run build`, so the decks are never
 * committed. `npm run decks:report` also prints slice 0's spike report.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { JLPT_LEVELS, type Deck, type DeckWord } from '../src/deck/types.ts';
import { deckReport } from './deck-report.ts';
import { toDeckWord } from './deck-words.ts';
import { OPENJLPT_COMMIT, openPinnedDatabase, readKanji, readVocab } from './openjlpt.ts';

const DECK_DIRECTORY = 'public/decks';

const database = await openPinnedDatabase();
const rows = readVocab(database);
const kanjiTable = readKanji(database);
database.close();

const words: DeckWord[] = [];
for (const row of rows) {
  const deckWord = toDeckWord(row, kanjiTable);
  if (deckWord !== null) words.push(deckWord);
}

mkdirSync(DECK_DIRECTORY, { recursive: true });
for (const level of JLPT_LEVELS) {
  const levelIds = new Set(rows.filter((row) => row.level === level).map((row) => row.id));
  const deck: Deck = {
    level,
    sourceCommit: OPENJLPT_COMMIT,
    words: words.filter((word) => levelIds.has(word.id)),
  };
  writeFileSync(`${DECK_DIRECTORY}/${level.toLowerCase()}.json`, JSON.stringify(deck));
}
console.log(
  `Wrote ${words.length} words to ${DECK_DIRECTORY}/ (OpenJLPT ${OPENJLPT_COMMIT.slice(0, 7)})`,
);

if (process.argv.includes('--report')) console.log(`\n${deckReport(rows, words, kanjiTable)}`);
