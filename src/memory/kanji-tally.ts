/**
 * A day's most recognised and most missed kanji, for the play calendar.
 * In word mode, every kanji in a matched word counts as recognised once,
 * and every kanji in a missed or timed-out word as missed. In kanji mode, a
 * perfect round counts its kanji as recognised, and any other as missed.
 */
import type { GameEvent } from '../game/events.ts';
import type { KanjiRoundRecord } from './play-log.ts';
import { localDayOf } from './days.ts';

const KANJI = /\p{Script=Han}/gu;

export interface KanjiCount {
  kanji: string;
  count: number;
}

export interface KanjiDay {
  mostRecognised: KanjiCount | null;
  mostMissed: KanjiCount | null;
}

function addKanjiOf(text: string, counts: Map<string, number>): void {
  for (const kanji of new Set(text.match(KANJI) ?? [])) {
    counts.set(kanji, (counts.get(kanji) ?? 0) + 1);
  }
}

/** The kanji counted most; a tie goes to the one counted first. */
function mostOf(counts: ReadonlyMap<string, number>): KanjiCount | null {
  let top: KanjiCount | null = null;
  for (const [kanji, count] of counts)
    if (top === null || count > top.count) top = { kanji, count };
  return top;
}

interface Counts {
  recognised: Map<string, number>;
  missed: Map<string, number>;
}

/** Word mode's answers on `day`: a match recognises a word's kanji; a miss or a timeout misses them. */
function countWordEvents(
  day: string,
  wordEvents: readonly GameEvent[],
  wordTextById: ReadonlyMap<string, string>,
  counts: Counts,
): void {
  for (const event of wordEvents) {
    const text = wordTextById.get(event.word_id ?? '');
    if (text === undefined || localDayOf(event.at) !== day) continue;
    if (event.kind === 'match') addKanjiOf(text, counts.recognised);
    if (event.kind === 'miss' || event.kind === 'timeout') addKanjiOf(text, counts.missed);
  }
}

export function kanjiOfDay(
  day: string,
  wordEvents: readonly GameEvent[],
  wordTextById: ReadonlyMap<string, string>,
  kanjiRounds: readonly KanjiRoundRecord[],
): KanjiDay {
  const recognised = new Map<string, number>();
  const missed = new Map<string, number>();
  countWordEvents(day, wordEvents, wordTextById, { recognised, missed });
  for (const round of kanjiRounds) {
    if (round.day === day) addKanjiOf(round.kanji, round.isPerfect ? recognised : missed);
  }
  return { mostRecognised: mostOf(recognised), mostMissed: mostOf(missed) };
}
