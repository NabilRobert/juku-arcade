/** Each mode's name and one-line description, shared by the picker, boards and results. */
export const modes = {
  words: {
    name: 'Words',
    description: 'Match each {level} word to its reading. Counts toward your reviews.',
  },
  kanji: {
    name: 'Kanji',
    description:
      'Find every reading of a kanji among {cards} cards, with {lanterns} lanterns a sheet. Counts toward kanji reviews.',
  },
  bunpou: {
    name: 'Bunpou',
    description: 'Put each sentence in order, then watch the tale. Counts toward grammar reviews.',
    note: 'N5 only for now · still in development',
  },
  dojo: {
    name: 'Practice',
    description: "Words, kanji and grammar you've met, until {lanterns} misses. Ranked.",
    bestRun: 'Best run',
  },
  /** What each level goal counts, as its card says it (level-goals.ts). */
  goals: {
    wordsKnown: 'Words known',
    kanjiMastered: 'Kanji mastered',
    grammarKnown: 'Grammar known',
  },
};
