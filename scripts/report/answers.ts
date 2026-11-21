/**
 * What the reports need to know about game events: which are answers,
 * right or wrong, and which card in a wrong pair was the word.
 * Peeks count as wrong, as they do for the review engine.
 */
import { isKanji } from '../../src/deck/kana.ts';
import type { GameEvent } from '../../src/game/events.ts';

export function isAnswer(event: GameEvent): boolean {
  return (
    event.word_id !== null &&
    (event.kind === 'match' || event.kind === 'miss' || event.kind === 'peek')
  );
}

export function isWrong(event: GameEvent): boolean {
  return event.kind === 'miss' || event.kind === 'peek';
}

export function isRight(event: GameEvent): boolean {
  return event.kind === 'match' && event.outcome === 'clean';
}

const hasKanji = (text: string | null): boolean => text !== null && [...text].some(isKanji);

/** In a wrong pair, the reading the player picked: the card without kanji. */
export function pickedReading(event: GameEvent): string | null {
  if (event.kind !== 'miss') return null;
  return hasKanji(event.first_card) ? event.second_card : event.first_card;
}

/** Each word's spelling, from the word card's text in its events. */
export function wordSpellings(events: readonly GameEvent[]): Map<string, string> {
  const spellings = new Map<string, string>();
  for (const event of events) {
    if (event.word_id === null || spellings.has(event.word_id)) continue;
    const spelling = [event.first_card, event.second_card].find(hasKanji);
    if (spelling) spellings.set(event.word_id, spelling);
  }
  return spellings;
}

/** A short form of the anonymous player ID for reports. */
export const shortId = (playerId: string): string => playerId.slice(0, 8);

export function eventsByPlayer(events: readonly GameEvent[]): Map<string, GameEvent[]> {
  const byPlayer = new Map<string, GameEvent[]>();
  for (const event of events) {
    const list = byPlayer.get(event.player_id) ?? [];
    list.push(event);
    byPlayer.set(event.player_id, list);
  }
  return byPlayer;
}
