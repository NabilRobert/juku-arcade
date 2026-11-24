// The haiku that close a Bunpou run: fitting the tale, never repeated within a round, and collected.
import { afterEach, describe, expect, it } from 'vitest';
import { seededRandom } from '../src/game/random.ts';
import { HAIKU_BANK, type Haiku } from '../src/grammar/haiku-bank.ts';
import {
  loadHaikuShelf,
  pickHaiku,
  saveHaikuShelf,
  type HaikuShelf,
} from '../src/grammar/haiku.ts';

const EMPTY: HaikuShelf = { collected: [], round: [] };
const bank: Haiku[] = [
  { id: 'station', lines: ['a', 'b', 'c'], poet: null, tags: ['駅'] },
  { id: 'park', lines: ['a', 'b', 'c'], poet: null, tags: ['公園'] },
  { id: 'night', lines: ['a', 'b', 'c'], poet: 'poet', tags: ['夜'] },
];

afterEach(() => {
  localStorage.clear();
});

describe('the closing haiku', () => {
  it('prefers one tagged with a word from the last tale’s setting', () => {
    const pick = pickHaiku(EMPTY, ['先生', '公園'], seededRandom(1), bank);
    expect(pick.haiku.id).toBe('park');
  });

  it('never repeats one until every haiku has come up, then starts a new round', () => {
    let shelf = EMPTY;
    const seen: string[] = [];
    for (let run = 0; run < bank.length; run++) {
      const pick = pickHaiku(shelf, ['公園'], seededRandom(run), bank);
      seen.push(pick.haiku.id);
      shelf = pick.shelf;
    }
    expect([...seen].sort()).toEqual(['night', 'park', 'station']);
    const next = pickHaiku(shelf, ['公園'], seededRandom(9), bank);
    expect(next.shelf.round).toEqual([next.haiku.id]);
    expect(next.isNew).toBe(false);
  });

  it('adds a new haiku to the collection, once', () => {
    const first = pickHaiku(EMPTY, ['駅'], seededRandom(1), bank);
    expect(first).toMatchObject({ isNew: true, shelf: { collected: ['station'] } });
    const again = pickHaiku({ collected: ['station'], round: [] }, ['駅'], seededRandom(1), bank);
    expect(again.isNew).toBe(false);
    expect(again.shelf.collected).toEqual(['station']);
  });

  it('keeps the collection in this browser', () => {
    saveHaikuShelf({ collected: ['park'], round: ['park'] });
    expect(loadHaikuShelf()).toEqual({ collected: ['park'], round: ['park'] });
  });

  it('has 24 haiku with unique ids, each three lines', () => {
    expect(HAIKU_BANK).toHaveLength(24);
    expect(new Set(HAIKU_BANK.map((haiku) => haiku.id)).size).toBe(24);
    expect(HAIKU_BANK.every((haiku) => haiku.lines.every((line) => line.length > 0))).toBe(true);
  });
});
