/**
 * Which haiku closes a run (D59), and the player's collection. A haiku
 * never comes up twice until every one in the bank has (this round);
 * then the round starts again. Among the haiku left this round, one
 * tagged with a word from the last tale's setting is preferred. The
 * collection is every haiku ever closed on, kept in this browser.
 */
import { HAIKU_KEY } from '../memory/progress-keys.ts';
import type { RandomSource } from '../game/deal.ts';
import { HAIKU_BANK, type Haiku } from './haiku-bank.ts';

export interface HaikuShelf {
  /** Every haiku ever collected, by id. */
  collected: readonly string[];
  /** The haiku shown since the bank last reshuffled. */
  round: readonly string[];
}

export interface HaikuPick {
  haiku: Haiku;
  isNew: boolean;
  shelf: HaikuShelf;
}

const EMPTY_SHELF: HaikuShelf = { collected: [], round: [] };

function pickFrom<T>(items: readonly T[], random: RandomSource): T | undefined {
  return items[Math.floor(random() * items.length)];
}

/** The next haiku for a tale set among `settingWords`, and the shelf after it. */
export function pickHaiku(
  shelf: HaikuShelf,
  settingWords: readonly string[],
  random: RandomSource,
  bank: readonly Haiku[] = HAIKU_BANK,
): HaikuPick {
  const isRoundOver = bank.every((haiku) => shelf.round.includes(haiku.id));
  const round = isRoundOver ? [] : shelf.round;
  const left = bank.filter((haiku) => !round.includes(haiku.id));
  const fitting = left.filter((haiku) => haiku.tags.some((tag) => settingWords.includes(tag)));
  const haiku = pickFrom(fitting.length > 0 ? fitting : left, random) ?? bank[0];
  if (haiku === undefined) throw new Error('The haiku bank is empty: add haiku to haiku-bank.ts');
  const isNew = !shelf.collected.includes(haiku.id);
  return {
    haiku,
    isNew,
    shelf: {
      collected: isNew ? [...shelf.collected, haiku.id] : shelf.collected,
      round: [...round, haiku.id],
    },
  };
}

export function loadHaikuShelf(): HaikuShelf {
  try {
    const saved = JSON.parse(
      localStorage.getItem(HAIKU_KEY) ?? 'null',
    ) as Partial<HaikuShelf> | null;
    if (saved === null) return EMPTY_SHELF;
    return { collected: saved.collected ?? [], round: saved.round ?? [] };
  } catch {
    return EMPTY_SHELF;
  }
}

export function saveHaikuShelf(shelf: HaikuShelf): void {
  try {
    localStorage.setItem(HAIKU_KEY, JSON.stringify(shelf));
  } catch {
    // Storage can be blocked (a private window); the collection then lasts this visit.
  }
}
