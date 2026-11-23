import { describe, expect, it } from 'vitest';
import { makeEvent, type GameEvent } from '../src/game/events.ts';
import { pickQuestions } from '../src/memory/check-up-questions.ts';
import {
  checkUpEvent,
  isHeldBack,
  isOnHold,
  optionsFor,
  type CheckRole,
} from '../src/memory/check-up.ts';
import { poolForNextSet } from '../src/memory/daily-deck.ts';
import { buildExport, exportFileName } from '../src/memory/export.ts';
import { deriveMemory } from '../src/memory/word-memory.ts';
import { answer } from './helpers/events.ts';
import { deckWord, seededRandom } from './helpers/fixtures.ts';

const PLAYER = 'player-1';
const DAY = '2026-11-21';
const NEXT_DAY = '2026-11-22';
const FIRST = { ...deckWord('w0', '語0', 'ご0'), missChanceGuess: 0.1 };
const DECK = Array.from({ length: 30 }, (_, index) => ({
  ...deckWord(`w${index}`, `語${index}`, `ご${index}`),
  missChanceGuess: 0.1 + index / 100,
}));

function checked(wordId: string, day: string, role: CheckRole, isRight = true): GameEvent {
  return makeEvent({ playerId: PLAYER, sessionId: 's', classCode: null }, new Date(), {
    kind: isRight ? 'check_up_right' : 'check_up_wrong',
    check_up_role: role,
    word_id: wordId,
    at: `${day}T09:00:00+07:00`,
    level: 0,
    set_index: 0,
  });
}

/** A word this player holds back, and one they don't, from the deck. */
function wordsBy(isHeld: boolean): string[] {
  return DECK.map((word) => word.id).filter((id) => isHeldBack(PLAYER, id) === isHeld);
}

describe('held-back assignment', () => {
  it('holds back about 1 word in 3', () => {
    const ids = Array.from({ length: 3000 }, (_, index) => `word-${index}`);
    const share = ids.filter((id) => isHeldBack(PLAYER, id)).length / ids.length;
    expect(share).toBeGreaterThan(0.3);
    expect(share).toBeLessThan(0.37);
  });

  it('gives the same answer every time for the same player and word', () => {
    expect(isHeldBack(PLAYER, 'w1')).toBe(isHeldBack(PLAYER, 'w1'));
  });
});

describe('check-up history', () => {
  it('keeps a held-back word out of play for 3 days after its before question', () => {
    const held = wordsBy(true)[0] ?? '';
    const memory = deriveMemory([checked(held, DAY, 'before')]);
    expect(isOnHold(memory.checkUps, held, '2026-11-23')).toBe(true);
    expect(isOnHold(memory.checkUps, held, '2026-11-24')).toBe(false);
    expect(poolForNextSet(DECK, memory, DAY, seededRandom(1)).map((word) => word.id)).not.toContain(
      held,
    );
  });

  it('lets a word answered right in its before question still enter play (C3)', () => {
    const played = wordsBy(false)[0] ?? '';
    const memory = deriveMemory([checked(played, DAY, 'before', true)]);
    expect(isOnHold(memory.checkUps, played, DAY)).toBe(false);
  });

  it('never changes the review schedule (C4)', () => {
    const memory = deriveMemory([
      checked('w0', DAY, 'before', false),
      checked('w0', NEXT_DAY, 'after', false),
    ]);
    expect(memory.words.has('w0')).toBe(false);
  });
});

describe('picking questions', () => {
  it('asks a new player 2 before questions about the next new words', () => {
    const questions = pickQuestions(DECK, deriveMemory([]), DAY, seededRandom(1));
    expect(questions.map((question) => [question.role, question.word.id])).toEqual([
      ['before', 'w0'],
      ['before', 'w1'],
    ]);
  });

  it('asks after questions about checked words first played at least a day ago', () => {
    const played = wordsBy(false).slice(0, 2);
    const log = played.flatMap((id) => [checked(id, DAY, 'before'), answer(id, DAY, 'clean')]);
    const roles = (day: string) =>
      pickQuestions(DECK, deriveMemory(log), day, seededRandom(1)).filter(
        (q) => q.role === 'after',
      );
    expect(roles(DAY)).toEqual([]);
    expect(
      roles(NEXT_DAY)
        .map((question) => question.word.id)
        .sort(),
    ).toEqual([...played].sort());
  });

  it('asks a held-back question about a word held since yesterday and not yet played', () => {
    const held = wordsBy(true)[0] ?? '';
    const questions = pickQuestions(
      DECK,
      deriveMemory([checked(held, DAY, 'before')]),
      NEXT_DAY,
      seededRandom(1),
    );
    expect(questions.find((question) => question.role === 'held_back')?.word.id).toBe(held);
  });
});

describe('a question', () => {
  it('offers 4 readings: the right one and 3 that are no valid reading of the word', () => {
    const word = { ...FIRST, otherReadings: ['ご5'] };
    const options = optionsFor(word, DECK, seededRandom(2));
    expect(options).toHaveLength(4);
    expect(options).toContain(word.reading);
    expect(options).not.toContain('ご5');
  });

  it('counts a timeout as wrong, with no reading chosen', () => {
    const question = { word: FIRST, role: 'before' as const, options: [] };
    const event = checkUpEvent(
      { playerId: PLAYER, sessionId: 's', classCode: null },
      question,
      null,
      8000,
      new Date(),
    );
    expect(event).toMatchObject({
      kind: 'check_up_wrong',
      check_up_role: 'before',
      second_card: null,
      seconds_left: 0,
    });
  });
});

describe('the export', () => {
  it('holds every event with the anonymous player ID and class code, and no name', () => {
    const settings = {
      playerId: 'abcdef12-3456',
      level: 'N5' as const,
      classCode: 'N5-SAT',
      bestCombo: 0,
      playDay: null,
      playMsToday: 0,
      checkUpOfferedDay: null,
    };
    const file = buildExport(
      [answer('w0', DAY, 'clean')],
      settings,
      new Date('2026-11-21T12:00:00Z'),
    );
    expect(file).toMatchObject({
      format_version: 1,
      player_id: 'abcdef12-3456',
      class_code: 'N5-SAT',
      event_count: 1,
    });
    expect(exportFileName(file)).toBe('juku-arcade-abcdef12-2026-11-21.json');
  });
});
