/**
 * Stats, grammar stats, the research page (pages/research.ts), About the
 * data, the check-up and the wellbeing notes.
 */
import { research } from './pages/research.ts';

export const pages = {
  stats: {
    title: 'Your stats',
    wordsKnown: 'Words known ({level})',
    rightToday: 'Right today',
    rightOverall: 'Right overall',
    rightCount: '{count} right',
    bestCombo: 'Best combo',
    bestScore: 'Best score',
    playedToday: 'Played today',
    minutes: '{minutes} min',
    setsPlayed: 'Sets played',
    daysPlayed: 'Days played',
    missedMost: 'Missed most',
    noMisses: 'No misses yet.',
    mistakesByKind: 'Mistakes by kind',
    noMistakes: 'No mistakes yet.',
    footnote:
      "From what you've played in this browser. Kanji mode and practice mode aren't counted.",
    /** memory/stats.ts: mistakeName. */
    mistakes: {
      longVowel: 'Long vowels (おう or おお?)',
      smallTsu: 'Small っ',
      dakuten: 'Dakuten (か or が?)',
      smallYoon: 'Small ゃゅょ',
      otherReading: "Another of the kanji's readings",
      mixUp: 'Mixing up two words',
    },
  },
  grammarStats: {
    title: 'Grammar',
    known: 'Grammar known',
    seen: 'Grammar seen',
    missedMost: 'Grammar missed most',
    mistakesByKind: 'Grammar mistakes by kind',
    /** memory/grammar-stats.ts: brokenRuleName. */
    brokenRules: {
      verbNotLast: 'The verb not at the end',
      particleAfterWrongWord: 'A particle after the wrong word',
      piecesOutOfOrder: "A pattern's pieces out of order",
    },
  },
  about: {
    title: 'About the data',
    containsData:
      "Contains data from {openJlpt} ({licence}), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's JLPT lists, and Tatoeba.",
    jmdictLink: 'JMdict and KANJIDIC2',
    jmdict:
      '{link}, Electronic Dictionary Research and Development Group: meanings, readings, kanji data.',
    wallerLink: "Jonathan Waller's JLPT lists",
    waller: '{link} (CC BY): the N5–N1 levels.',
    tatoeba: '{link} (CC BY 2.0 FR): example sentences.',
    levelsNote:
      "JLPT levels are approximate: the Japan Foundation hasn't published official word lists since 2010. The game's word decks are derived from OpenJLPT, so they are also CC BY-SA 4.0.",
  },
  checkUp: {
    title: 'Daily check-up',
    intro:
      "{count} quick questions, about a minute. It shows what's sticking. It doesn't change your score or your reviews.",
    start: 'Start',
    skip: 'Skip today',
    timeLeft: 'Time left for this word',
  },
  wellbeing: {
    capped: "That's today's play. See you tomorrow!",
    capNote: 'Your school set a daily limit of {minutes} minutes.',
    nudge: '{minutes} minutes: a good place to stop. See you tomorrow!',
    nudgeNote: 'Short daily practice helps words stick.',
    stop: 'Stop for today',
    keepGoing: 'Keep going',
  },
  research,
};
