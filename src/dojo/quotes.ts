/**
 * Quotes for the dojo's game-over screen (D62): a line on learning and
 * keeping at it, from a historic figure or a well-known character. And
 * quotes on resting, for End run's "End this run?" (REST_QUOTES): stopping
 * for a while is fine (playtest decision, 2026-11-26).
 * Only quotes with a known source are here (a book, a letter, a film),
 * never the popular misattributions. Each is short, and the translations
 * are in plain English and Indonesian (i18n/en/practice.ts, i18n/id/).
 *
 * `text` is a getter, so the words are looked up in the interface language
 * each time a card shows them, and follow a language change. The names and
 * sources are titles and citations, so they stay as written.
 */
import { pickOne } from '../game/random.ts';
import type { RandomSource } from '../game/deal.ts';
import { translate } from '../i18n/index.ts';

export interface Quote {
  readonly text: string;
  readonly by: string;
  /** Where the words come from, so each can be checked. */
  source: string;
}

export const QUOTES: readonly Quote[] = [
  {
    get text() {
      return translate('practice.quotes.journey');
    },
    by: 'Lao Tzu',
    source: 'Tao Te Ching, chapter 64',
  },
  {
    get text() {
      return translate('practice.quotes.pleasureToLearn');
    },
    by: 'Confucius',
    source: 'Analects 1.1',
  },
  {
    get text() {
      return translate('practice.quotes.knowWhatYouKnow');
    },
    by: 'Confucius',
    source: 'Analects 2.17',
  },
  {
    get text() {
      return translate('practice.quotes.realMistake');
    },
    by: 'Confucius',
    source: 'Analects 15.30',
  },
  {
    get text() {
      return translate('practice.quotes.teachAndLearn');
    },
    by: 'Seneca',
    source: 'Letters to Lucilius, 7',
  },
  {
    get text() {
      return translate('practice.quotes.shoulders');
    },
    by: 'Isaac Newton',
    source: 'Letter to Robert Hooke, 1675',
  },
  {
    get text() {
      return translate('practice.quotes.standThenFly');
    },
    by: 'Mr. Miyagi',
    source: 'The Karate Kid (1984)',
  },
  {
    get text() {
      return translate('practice.quotes.doOrDoNot');
    },
    by: 'Yoda',
    source: 'The Empire Strikes Back (1980)',
  },
  {
    get text() {
      return translate('practice.quotes.timeGiven');
    },
    by: 'Gandalf',
    source: 'The Fellowship of the Ring (1954)',
  },
  {
    get text() {
      return translate('practice.quotes.genius');
    },
    by: 'Thomas Edison',
    source: "Quoted in Harper's Monthly, 1932",
  },
];

export const REST_QUOTES: readonly Quote[] = [
  {
    get text() {
      return translate('practice.restQuotes.notIdleness');
    },
    by: 'John Lubbock',
    source: 'The Use of Life (1894)',
  },
  {
    get text() {
      return translate('practice.restQuotes.restedField');
    },
    by: 'Ovid',
    source: 'The Art of Love, book 2',
  },
  {
    get text() {
      return translate('practice.restQuotes.unplug');
    },
    by: 'Anne Lamott',
    source: '12 Truths I Learned from Life and Writing, TED (2017)',
  },
  {
    get text() {
      return translate('practice.restQuotes.doingNothing');
    },
    by: 'Winnie the Pooh',
    source: 'Christopher Robin (2018)',
  },
  {
    get text() {
      return translate('practice.restQuotes.fallSeven');
    },
    get by() {
      return translate('practice.japaneseProverb');
    },
    source: '七転び八起き',
  },
];

/** One quote from the list (the game-over quotes unless another is given), picked at random. */
export function pickQuote(random: RandomSource, from: readonly Quote[] = QUOTES): Quote {
  const quote = pickOne(from, random);
  if (quote === undefined)
    throw new Error('This quote list is empty: add a quote to it in quotes.ts.');
  return quote;
}
