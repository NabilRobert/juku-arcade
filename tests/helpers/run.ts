// Helpers for driving a run in tests: a fixed context, and finding cards.
import { startRun, type RunContext, type RunState } from '../../src/game/run.ts';
import { tagsByRank } from '../../src/game/tags.ts';
import { deckWord, seededRandom } from './fixtures.ts';

const WORDS: [string, string][] = [
  ['学校', 'がっこう'], ['先生', 'せんせい'], ['電車', 'でんしゃ'], ['時間', 'じかん'],
  ['友達', 'ともだち'], ['毎日', 'まいにち'], ['天気', 'てんき'], ['名前', 'なまえ'],
]; // prettier-ignore

export const START_MS = 1_000_000;

export function makeContext(seed = 1): RunContext {
  const pool = WORDS.map(([word, reading], index) => ({
    ...deckWord(String(index), word, reading),
    missChanceGuess: index / 10,
  }));
  return {
    pool,
    tags: tagsByRank(pool),
    random: seededRandom(seed),
    identity: { playerId: 'player-1', sessionId: 'session-1' },
  };
}

export function start(seed = 1): { context: RunContext; state: RunState } {
  const context = makeContext(seed);
  return { context, state: startRun(context, START_MS) };
}

export function readingIndexOf(state: RunState, wordId: string): number {
  return state.set.readings.findIndex((card) => card.wordId === wordId);
}

/** A reading that belongs to another word in the set (not the decoy). */
export function otherWordsReadingIndex(state: RunState, wordId: string): number {
  return state.set.readings.findIndex((card) => card.wordId !== null && card.wordId !== wordId);
}

export function decoyIndex(state: RunState): number {
  return state.set.readings.findIndex((card) => card.wordId === null);
}

export function wordIdAt(state: RunState, position: number): string {
  return state.set.words[position]?.id ?? '';
}
