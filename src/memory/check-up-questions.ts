/**
 * Picks today's check-up questions (C2): words about to enter play
 * (before), words checked and then played at least a day ago (after), and
 * words checked and held back from play since at least yesterday (held back).
 */
import type { DeckWord } from '../deck/types.ts';
import type { RandomSource } from '../game/deal.ts';
import { optionsFor, QUESTIONS_PER_ROLE, type CheckRole, type Question } from './check-up.ts';
import type { Memory } from './word-memory.ts';

function beforeWords(deck: readonly DeckWord[], memory: Memory): DeckWord[] {
  return deck
    .filter((word) => !memory.words.has(word.id) && !memory.checkUps.has(word.id))
    .sort((a, b) => a.missChanceGuess - b.missChanceGuess || a.id.localeCompare(b.id));
}

function afterWords(deck: readonly DeckWord[], memory: Memory, today: string): DeckWord[] {
  return deck.filter((word) => {
    const record = memory.checkUps.get(word.id);
    const firstPlayDay = memory.words.get(word.id)?.firstSeenDay;
    return (
      record !== undefined &&
      !record.isAfterDone &&
      firstPlayDay !== undefined &&
      firstPlayDay < today
    );
  });
}

function heldBackWords(deck: readonly DeckWord[], memory: Memory, today: string): DeckWord[] {
  return deck.filter((word) => {
    const record = memory.checkUps.get(word.id);
    const isHeld = record?.heldUntilDay != null && !record.isHeldBackDone;
    return isHeld && record.beforeDay < today && !memory.words.has(word.id);
  });
}

/** Today's questions; fewer than 5 when the player is new or has little to recheck. */
export function pickQuestions(
  deck: readonly DeckWord[],
  memory: Memory,
  today: string,
  random: RandomSource,
): Question[] {
  const byRole: Record<CheckRole, DeckWord[]> = {
    before: beforeWords(deck, memory),
    after: afterWords(deck, memory, today),
    held_back: heldBackWords(deck, memory, today),
  };
  const roles = Object.keys(QUESTIONS_PER_ROLE) as CheckRole[];
  return roles.flatMap((role) =>
    byRole[role]
      .slice(0, QUESTIONS_PER_ROLE[role])
      .map((word) => ({ word, role, options: optionsFor(word, deck, random) })),
  );
}
