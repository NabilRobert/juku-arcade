/**
 * The research behind the game's design, for the research page
 * (ResearchPage.vue): what each study did and found, where in the paper
 * that is, and where the game uses it.
 * They're the 8 sources the client quote cites (section 2f, revised
 * 2026-11-26), each checked against a free copy of the full text. They
 * explain the design's choices; none of them studied this game, and the
 * page says so.
 *
 * Citations and venues stay as a reference list writes them (titles and
 * pages as the DOI registry gives them). The group headings, findings and
 * uses are interface text, in the message files
 * (i18n/en/pages/research.ts), looked up by each group's and source's id.
 */
import type { Messages } from '../i18n/en/index.ts';

type ResearchMessages = Messages['pages']['research'];
export type SourceId = keyof ResearchMessages['sources'];
export type SourceGroupId = keyof ResearchMessages['groups'];

export interface Source {
  id: SourceId;
  /** Authors, year and title, as a reference list writes them. */
  citation: string;
  /** Where it was published. */
  venue: string;
  /** Its DOI link. */
  url: string;
  /** A free copy of the full text, hosted by the authors, their university or the publisher. */
  freeCopyUrl: string;
}

export interface SourceGroup {
  id: SourceGroupId;
  sources: readonly Source[];
}

export const SOURCE_GROUPS: readonly SourceGroup[] = [
  {
    id: 'learning',
    sources: [
      {
        id: 'cepeda2006',
        citation:
          'Cepeda, Pashler, Vul, Wixted & Rohrer (2006). Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis.',
        venue: 'Psychological Bulletin 132(3), 354–380',
        url: 'https://doi.org/10.1037/0033-2909.132.3.354',
        freeCopyUrl: 'https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf',
      },
      {
        id: 'roediger2006',
        citation: 'Roediger & Karpicke (2006). Test-Enhanced Learning.',
        venue: 'Psychological Science 17(3), 249–255',
        url: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x',
        freeCopyUrl:
          'https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf',
      },
      {
        id: 'hattie2007',
        citation: 'Hattie & Timperley (2007). The Power of Feedback.',
        venue: 'Review of Educational Research 77(1), 81–112',
        url: 'https://doi.org/10.3102/003465430298487',
        freeCopyUrl: 'https://www.uky.edu/~gmswan3/575/Hattie_Timperly_2007.pdf',
      },
    ],
  },
  {
    id: 'motivation',
    sources: [
      {
        id: 'sailer2020',
        citation: 'Sailer & Homner (2020). The Gamification of Learning: a Meta-analysis.',
        venue: 'Educational Psychology Review 32(1), 77–112',
        url: 'https://doi.org/10.1007/s10648-019-09498-w',
        freeCopyUrl: 'https://opus.bibliothek.uni-augsburg.de/opus4/files/109056/109056.pdf',
      },
      {
        id: 'ryan2006',
        citation:
          'Ryan, Rigby & Przybylski (2006). The Motivational Pull of Video Games: A Self-Determination Theory Approach.',
        venue: 'Motivation and Emotion 30(4), 344–360',
        url: 'https://doi.org/10.1007/s11031-006-9051-8',
        freeCopyUrl:
          'https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf',
      },
    ],
  },
  {
    id: 'goals',
    sources: [
      {
        id: 'kivetz2006',
        citation:
          'Kivetz, Urminsky & Zheng (2006). The Goal-Gradient Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress, and Customer Retention.',
        venue: 'Journal of Marketing Research 43(1), 39–58',
        url: 'https://doi.org/10.1509/jmkr.43.1.39',
        freeCopyUrl:
          'https://business.columbia.edu/sites/default/files-efs/pubfiles/1200/goalgradient.pdf',
      },
    ],
  },
  {
    id: 'streak',
    sources: [
      {
        id: 'silverman2023',
        citation:
          'Silverman & Barasch (2023). On or Off Track: How (Broken) Streaks Affect Consumer Decisions.',
        venue: 'Journal of Consumer Research 49(6), 1095–1117',
        url: 'https://doi.org/10.1093/jcr/ucac029',
        freeCopyUrl:
          'https://udspace.udel.edu/bitstreams/7e3e3b64-8bf2-4527-ac93-94a160358165/download',
      },
    ],
  },
  {
    id: 'sound',
    sources: [
      {
        id: 'moreno2000',
        citation:
          'Moreno & Mayer (2000). A Coherence Effect in Multimedia Learning: The Case for Minimizing Irrelevant Sounds in the Design of Multimedia Instructional Messages.',
        venue: 'Journal of Educational Psychology 92(1), 117–125',
        url: 'https://doi.org/10.1037/0022-0663.92.1.117',
        freeCopyUrl: 'https://tecfa.unige.ch/tecfa/teaching/methodo/Moreno_Mayer00.pdf',
      },
    ],
  },
];
