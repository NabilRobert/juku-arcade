/**
 * The game measures that need the decks as well as the events (phase 3):
 *
 * - S2, daily deck completion: replays each player's events day by day and
 *   asks the app's own dailyProgress whether the deck was cleared that day;
 * - S3, difficulty learns: compares the deck's starting guess with the
 *   learned miss chance (R5) at predicting each later answer. Each answer
 *   is predicted from the answers before it only, so no answer is used to
 *   fit its own prediction.
 *
 * Each player's deck is the level in their latest export (load.ts).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Deck, DeckWord } from '../../src/deck/types.ts';
import type { GameEvent } from '../../src/game/events.ts';
import { dailyProgress } from '../../src/memory/daily-deck.ts';
import { learnedMissChance } from '../../src/memory/difficulty.ts';
import { applyEvent, emptyMemory, localDayOf } from '../../src/memory/word-memory.ts';
import { eventsByPlayer, groupEvents, isRight, isWrong } from './answers.ts';
import type { Share } from './play-measures.ts';

/** Predictions are kept inside this range, so one confident miss can't make the log loss infinite. */
const MIN_CHANCE = 0.01;

export interface PredictionScore {
  attempts: number;
  /** Average log loss of each prediction; lower is better. */
  guessLogLoss: number | null;
  learnedLogLoss: number | null;
}

/** Reads public/decks/*.json into a map from level (N5 and so on) to its words. */
export function readDecks(folder: string): Map<string, DeckWord[]> {
  const decks = new Map<string, DeckWord[]>();
  for (const name of readdirSync(folder).filter((file) => file.endsWith('.json'))) {
    const deck = JSON.parse(readFileSync(join(folder, name), 'utf8')) as Deck;
    decks.set(deck.level, deck.words);
  }
  return decks;
}

/** Each player's events with the words of the deck they played. */
function playersWithDecks(
  events: readonly GameEvent[],
  levelByPlayer: ReadonlyMap<string, string>,
  decks: ReadonlyMap<string, DeckWord[]>,
): { events: GameEvent[]; words: DeckWord[] }[] {
  const players = [];
  for (const [playerId, playerEvents] of eventsByPlayer(events)) {
    const words = decks.get(levelByPlayer.get(playerId) ?? '');
    if (words !== undefined) players.push({ events: playerEvents, words });
  }
  return players;
}

/** S2: of the days each player played, how many ended with the daily deck cleared. */
export function deckCompletion(
  events: readonly GameEvent[],
  levelByPlayer: ReadonlyMap<string, string>,
  decks: ReadonlyMap<string, DeckWord[]>,
): Share {
  const completion: Share = { count: 0, total: 0 };
  for (const player of playersWithDecks(events, levelByPlayer, decks)) {
    const memory = emptyMemory();
    for (const [day, dayEvents] of groupEvents(player.events, (event) => localDayOf(event.at))) {
      for (const event of dayEvents) applyEvent(memory, event);
      if (!dayEvents.some((event) => event.kind === 'deal')) continue;
      completion.total += 1;
      if (dailyProgress(player.words, memory, day).isCleared) completion.count += 1;
    }
  }
  return completion;
}

const logLoss = (missChance: number, isMiss: boolean): number => {
  const chance = Math.min(1 - MIN_CHANCE, Math.max(MIN_CHANCE, missChance));
  return -Math.log(isMiss ? chance : 1 - chance);
};

/** S3: scores both predictions on every answer to a word the player has answered before. */
export function difficultyPredictions(
  events: readonly GameEvent[],
  levelByPlayer: ReadonlyMap<string, string>,
  decks: ReadonlyMap<string, DeckWord[]>,
): PredictionScore {
  let attempts = 0;
  let guessTotal = 0;
  let learnedTotal = 0;
  for (const player of playersWithDecks(events, levelByPlayer, decks)) {
    const wordsById = new Map(player.words.map((word) => [word.id, word]));
    const memory = emptyMemory();
    for (const event of player.events) {
      const word = wordsById.get(event.word_id ?? '');
      const isAnswer = isRight(event) || isWrong(event);
      if (word !== undefined && isAnswer && memory.words.has(word.id)) {
        attempts += 1;
        guessTotal += logLoss(word.missChanceGuess, isWrong(event));
        learnedTotal += logLoss(learnedMissChance(word, memory), isWrong(event));
      }
      applyEvent(memory, event);
    }
  }
  if (attempts === 0) return { attempts, guessLogLoss: null, learnedLogLoss: null };
  return { attempts, guessLogLoss: guessTotal / attempts, learnedLogLoss: learnedTotal / attempts };
}
