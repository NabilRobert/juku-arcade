/**
 * Particles given on a Bunpou line (D77). Playtesters found it too hard to
 * order four or five loose tiles blind, so some lines start with their
 * particles already in their boxes, fixed there. Each line gets one of
 * three helps, as likely as each other: every particle given, all but one
 * given, or none given (every tile loose, as before D77).
 *
 * A given particle sits where the template's own order has it, and that
 * order is always a right one (order-check.ts), so the player can still
 * finish the line right.
 */
import { shuffled, type RandomSource } from '../game/deal.ts';
import type { Sentence } from './fill.ts';

/**
 * The particles the templates use as loose tiles (templates/). から、 and
 * が、 aren't here: with their comma they're a pattern's pieces (D60), the
 * grammar a pattern line tests, so they're never given.
 */
export const PARTICLES: ReadonlySet<string> = new Set([
  'は',
  'を',
  'に',
  'へ',
  'で',
  'が',
  'も',
  'と',
  'から',
  'まで',
  'には',
]);

/** Where the sentence's particle tiles sit in the template's order. */
export function particlePositions(sentence: Sentence): number[] {
  return sentence.tiles.flatMap((tile, index) => (PARTICLES.has(tile.text) ? [index] : []));
}

/** How many particles to give: all, all but one, or none, each as likely. */
function givenCount(particleCount: number, random: RandomSource): number {
  // A line with one particle has two choices (it, or none); with none, one.
  const choices = [...new Set([particleCount, particleCount - 1, 0])].filter((count) => count >= 0);
  return choices[Math.floor(random() * choices.length)] ?? 0;
}

/** The boxes that start filled, in order: some of the line's particles, picked at random. */
export function chooseGivenBoxes(sentence: Sentence, random: RandomSource): number[] {
  const positions = particlePositions(sentence);
  const count = givenCount(positions.length, random);
  return shuffled(positions, random)
    .slice(0, count)
    .sort((first, second) => first - second);
}
