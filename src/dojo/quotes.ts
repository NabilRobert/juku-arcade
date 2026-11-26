/**
 * Quotes for the dojo's game-over screen (D62): a line on learning and
 * keeping at it, from a historic figure or a well-known character. And
 * quotes on resting, for End run's "End this run?" (REST_QUOTES): stopping
 * for a while is fine (playtest decision, 2026-11-26).
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

export const REST_QUOTES: readonly Quote[] = [
  {
    text: "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day, listening to the murmur of the water, or watching the clouds float across the sky, is by no means a waste of time.",
    by: 'John Lubbock',
    source: 'The Use of Life (1894)',
  },
  {
    text: 'Take rest; a field that has rested gives a bountiful crop.',
    by: 'Ovid',
    source: 'The Art of Love, book 2',
  },
  {
    text: 'Almost everything will work again if you unplug it for a few minutes, including you.',
    by: 'Anne Lamott',
    source: '12 Truths I Learned from Life and Writing, TED (2017)',
  },
  {
    text: 'Doing nothing often leads to the very best something.',
    by: 'Winnie the Pooh',
    source: 'Christopher Robin (2018)',
  },
  {
    text: 'Fall seven times, stand up eight.',
    by: 'Japanese proverb',
    source: '七転び八起き',
  },
];

/** One quote from the list (the game-over quotes unless another is given), picked at random. */
export function pickQuote(random: RandomSource, from: readonly Quote[] = QUOTES): Quote {
  const quote = from[Math.floor(random() * from.length)] ?? from[0];
  if (quote === undefined)
    throw new Error('This quote list is empty: add a quote to it in quotes.ts.');
  return quote;
}
