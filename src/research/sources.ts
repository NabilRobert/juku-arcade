/**
 * The research behind the game's design, for the research page
 * (ResearchPage.vue): what each paper or book found and where the game
 * uses it. They back the design's ideas; none of them studied this game,
 * and the page says so.
 *
 * Citations and venues stay as a reference list writes them. The group
 * headings, findings and uses are interface text, in the message files
 * (i18n/en/pages/research.ts), looked up by each group's and source's id.
 */
import type { Messages } from '../i18n/en/index.ts';

type ResearchMessages = Messages['pages']['research'];
export type SourceId = keyof ResearchMessages['sources'];
export type SourceGroupId = keyof ResearchMessages['groups'];
/** A note around the venue, worded in the interface language: "(book)", "Open access on …". */
export type VenueNote = keyof ResearchMessages['venueNotes'];

export interface Source {
  id: SourceId;
  /** Authors, year and title, as a reference list writes them. */
  citation: string;
  /** Where it was published. */
  venue: string;
  venueNote?: VenueNote;
  /** A link to it (a DOI where there is one); none for a book. */
  url: string | null;
}

export interface SourceGroup {
  id: SourceGroupId;
  sources: readonly Source[];
}

export const SOURCE_GROUPS: readonly SourceGroup[] = [
  {
    id: 'comingBack',
    sources: [
      {
        id: 'ryan2006',
        citation: 'Ryan, Rigby & Przybylski (2006). The Motivational Pull of Video Games.',
        venue: 'Motivation and Emotion 30, 344–360',
        url: 'https://doi.org/10.1007/s11031-006-9051-8',
      },
      {
        id: 'przybylski2010',
        citation: 'Przybylski, Rigby & Ryan (2010). A Motivational Model of Video Game Engagement.',
        venue: 'Review of General Psychology 14(2), 154–166',
        url: 'https://doi.org/10.1037/a0019440',
      },
    ],
  },
  {
    id: 'compelling',
    sources: [
      {
        id: 'king2010',
        citation:
          'King, Delfabbro & Griffiths (2010). Video Game Structural Characteristics: A New Psychological Taxonomy.',
        venue: 'International Journal of Mental Health and Addiction 8, 90–106',
        url: 'https://doi.org/10.1007/s11469-009-9206-4',
      },
      {
        id: 'ferster1957',
        citation: 'Ferster & Skinner (1957). Schedules of Reinforcement.',
        venue: 'Appleton-Century-Crofts',
        venueNote: 'book',
        url: null,
      },
      {
        id: 'schultz1997',
        citation: 'Schultz, Dayan & Montague (1997). A Neural Substrate of Prediction and Reward.',
        venue: 'Science 275(5306), 1593–1599',
        url: 'https://doi.org/10.1126/science.275.5306.1593',
      },
      {
        id: 'berridge1998',
        citation:
          'Berridge & Robinson (1998). What Is the Role of Dopamine in Reward: Hedonic Impact, Reward Learning, or Incentive Salience?',
        venue: 'Brain Research Reviews 28(3), 309–369',
        url: 'https://doi.org/10.1016/S0165-0173(98)00019-8',
      },
      {
        id: 'clark2009',
        citation:
          'Clark, Lawrence, Astley-Jones & Gray (2009). Gambling Near-Misses Enhance Motivation to Gamble and Recruit Win-Related Brain Circuitry.',
        venue: 'Neuron 61(3), 481–490',
        url: 'https://doi.org/10.1016/j.neuron.2008.12.031',
      },
    ],
  },
  {
    id: 'goals',
    sources: [
      {
        id: 'kivetz2006',
        citation: 'Kivetz, Urminsky & Zheng (2006). The Goal-Gradient Hypothesis Resurrected.',
        venue: 'Journal of Marketing Research 43(1), 39–58',
        url: 'https://doi.org/10.1509/jmkr.43.1.39',
      },
      {
        id: 'nunes2006',
        citation: 'Nunes & Drèze (2006). The Endowed Progress Effect.',
        venue: 'Journal of Consumer Research 32(4), 504–512',
        url: 'https://doi.org/10.1086/500480',
      },
      {
        id: 'csikszentmihalyi1990',
        citation: 'Csikszentmihalyi (1990). Flow: The Psychology of Optimal Experience.',
        venue: 'Harper & Row',
        venueNote: 'book',
        url: null,
      },
      {
        id: 'sweetser2005',
        citation:
          'Sweetser & Wyeth (2005). GameFlow: A Model for Evaluating Player Enjoyment in Games.',
        venue: 'Computers in Entertainment 3(3)',
        url: 'https://doi.org/10.1145/1077246.1077253',
      },
    ],
  },
  {
    id: 'streak',
    sources: [
      {
        id: 'kahneman1979',
        citation: 'Kahneman & Tversky (1979). Prospect Theory: An Analysis of Decision under Risk.',
        venue: 'Econometrica 47(2), 263–291',
        url: 'https://doi.org/10.2307/1914185',
      },
      {
        id: 'fogg2009',
        citation: 'Fogg (2009). A Behavior Model for Persuasive Design.',
        venue: 'Persuasive Technology 2009',
        url: 'https://doi.org/10.1145/1541948.1541999',
      },
      {
        id: 'eyal2014',
        citation: 'Eyal (2014). Hooked: How to Build Habit-Forming Products.',
        venue: 'Portfolio',
        venueNote: 'bookNotPeerReviewed',
        url: null,
      },
      {
        id: 'yancey2020',
        citation:
          'Yancey & Settles (2020). A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications.',
        venue: 'KDD 2020 (Duolingo)',
        url: 'https://research.duolingo.com/papers/yancey.kdd20.pdf',
      },
    ],
  },
  {
    id: 'learning',
    sources: [
      {
        id: 'cepeda2006',
        citation:
          'Cepeda, Pashler, Vul, Wixted & Rohrer (2006). Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis.',
        venue: 'Psychological Bulletin 132(3), 354–380',
        url: 'https://doi.org/10.1037/0033-2909.132.3.354',
      },
      {
        id: 'settles2016',
        citation:
          'Settles & Meeder (2016). A Trainable Spaced Repetition Model for Language Learning.',
        venue: 'ACL 2016 (Duolingo)',
        url: 'https://doi.org/10.18653/v1/P16-1174',
      },
      {
        id: 'hamari2014',
        citation:
          'Hamari, Koivisto & Sarsa (2014). Does Gamification Work? A Literature Review of Empirical Studies on Gamification.',
        venue: 'HICSS 2014',
        url: 'https://doi.org/10.1109/HICSS.2014.377',
      },
      {
        id: 'quizlet2024',
        citation:
          'Quantifying Cognitive and Affective Impacts of Quizlet on Learning Outcomes: A Systematic Review and Comprehensive Meta-Analysis (2024).',
        venue: 'PubMed Central',
        venueNote: 'openAccess',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10951395/',
      },
    ],
  },
];
