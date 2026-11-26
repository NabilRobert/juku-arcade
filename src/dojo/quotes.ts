/**
 * Quotes for the dojo's game-over screen (D62): a line on learning and
 * keeping at it, from a historic figure or a well-known character.
 * Only quotes with a known source are here (a book, a letter, a film),
 * never the popular misattributions. Each is short, and the translations
 * are in plain English.
 */
import type { RandomSource } from '../game/deal.ts';

export interface Quote {
  text: string;
  by: string;
  /** Where the words come from, so each can be checked. */
  source: string;
}

export const QUOTES: readonly Quote[] = [
  {
    text: 'A journey of a thousand miles begins with a single step.',
    by: 'Lao Tzu',
    source: 'Tao Te Ching, chapter 64',
  },
  {
    text: 'Is it not a pleasure to learn, and to practise what you have learned?',
    by: 'Confucius',
    source: 'Analects 1.1',
  },
  {
    text: 'To know what you know, and to know what you do not know: that is knowledge.',
    by: 'Confucius',
    source: 'Analects 2.17',
  },
  {
    text: 'To make a mistake and not correct it: that is the real mistake.',
    by: 'Confucius',
    source: 'Analects 15.30',
  },
  {
    text: 'Even while they teach, people learn.',
    by: 'Seneca',
    source: 'Letters to Lucilius, 7',
  },
  {
    text: 'If I have seen further, it is by standing on the shoulders of giants.',
    by: 'Isaac Newton',
    source: 'Letter to Robert Hooke, 1675',
  },
  {
    text: 'First learn stand, then learn fly.',
    by: 'Mr. Miyagi',
    source: 'The Karate Kid (1984)',
  },
  {
    text: 'Do. Or do not. There is no try.',
    by: 'Yoda',
    source: 'The Empire Strikes Back (1980)',
  },
  {
    text: 'All we have to decide is what to do with the time that is given us.',
    by: 'Gandalf',
    source: 'The Fellowship of the Ring (1954)',
  },
  {
    text: 'Genius is one per cent inspiration and ninety-nine per cent perspiration.',
    by: 'Thomas Edison',
    source: "Quoted in Harper's Monthly, 1932",
  },
];

export function pickQuote(random: RandomSource): Quote {
  const quote = QUOTES[Math.floor(random() * QUOTES.length)] ?? QUOTES[0];
  if (quote === undefined) throw new Error('quotes.ts has no quotes: add one to QUOTES.');
  return quote;
}
