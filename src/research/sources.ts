/**
 * The research behind the game's design, for the research page
 * (ResearchPage.vue): what each paper or book found and where the game
 * uses it. They back the design's ideas; none of them studied this game,
 * and the page says so.
 */

export interface Source {
  /** Authors, year and title, as a reference list writes them. */
  citation: string;
  /** Where it was published. */
  venue: string;
  /** A link to it (a DOI where there is one); none for a book. */
  url: string | null;
  finding: string;
  inGame: string;
}

export interface SourceGroup {
  heading: string;
  sources: readonly Source[];
}

export const SOURCE_GROUPS: readonly SourceGroup[] = [
  {
    heading: 'Why players come back',
    sources: [
      {
        citation: 'Ryan, Rigby & Przybylski (2006). The Motivational Pull of Video Games.',
        venue: 'Motivation and Emotion 30, 344–360',
        url: 'https://doi.org/10.1007/s11031-006-9051-8',
        finding:
          'Feeling capable, free to choose and connected to others each predicted enjoyment and future play.',
        inGame: 'Level goals and ranks, a choice of modes, and the leaderboard.',
      },
      {
        citation: 'Przybylski, Rigby & Ryan (2010). A Motivational Model of Video Game Engagement.',
        venue: 'Review of General Psychology 14(2), 154–166',
        url: 'https://doi.org/10.1037/a0019440',
        finding:
          'Games that meet those needs bring players back in a healthy way; obsessive play comes from pressure instead.',
        inGame: 'Why the 15- and 30-minute nudges and the daily cap stay.',
      },
    ],
  },
  {
    heading: 'What makes play compelling, and where it tips into harm',
    sources: [
      {
        citation:
          'King, Delfabbro & Griffiths (2010). Video Game Structural Characteristics: A New Psychological Taxonomy.',
        venue: 'International Journal of Mental Health and Addiction 8, 90–106',
        url: 'https://doi.org/10.1007/s11469-009-9206-4',
        finding:
          'A checklist of what draws players in: social features, presentation, control, story, and rewards and punishments.',
        inGame: 'The base the design was checked against.',
      },
      {
        citation: 'Ferster & Skinner (1957). Schedules of Reinforcement.',
        venue: 'Appleton-Century-Crofts (book)',
        url: null,
        finding: 'Rewards that come unpredictably hold behaviour most strongly.',
        inGame: 'The shop turning up 1 time in 3, omikuji gifts, and which haiku a show closes on.',
      },
      {
        citation: 'Schultz, Dayan & Montague (1997). A Neural Substrate of Prediction and Reward.',
        venue: 'Science 275(5306), 1593–1599',
        url: 'https://doi.org/10.1126/science.275.5306.1593',
        finding:
          'Dopamine responds to rewards that are better than expected, not to expected ones.',
        inGame: 'Why surprises (crests, the shop) feel better than fixed rewards.',
      },
      {
        citation:
          'Berridge & Robinson (1998). What Is the Role of Dopamine in Reward: Hedonic Impact, Reward Learning, or Incentive Salience?',
        venue: 'Brain Research Reviews 28(3), 309–369',
        url: 'https://doi.org/10.1016/S0165-0173(98)00019-8',
        finding: 'Wanting and liking are separate systems; compulsion is wanting without liking.',
        inGame: 'The warning sign the design avoids: no paid or random rewards.',
      },
      {
        citation:
          'Clark, Lawrence, Astley-Jones & Gray (2009). Gambling Near-Misses Enhance Motivation to Gamble and Recruit Win-Related Brain Circuitry.',
        venue: 'Neuron 61(3), 481–490',
        url: 'https://doi.org/10.1016/j.neuron.2008.12.031',
        finding: 'Just missing a goal makes people want to try again, almost as much as winning.',
        inGame: 'Results that show how close a run came to your best.',
      },
    ],
  },
  {
    heading: 'Goals and progress',
    sources: [
      {
        citation: 'Kivetz, Urminsky & Zheng (2006). The Goal-Gradient Hypothesis Resurrected.',
        venue: 'Journal of Marketing Research 43(1), 39–58',
        url: 'https://doi.org/10.1509/jmkr.43.1.39',
        finding: 'People speed up as a goal gets closer.',
        inGame: "Today's deck as a daily goal, and progress toward knowing a level's words.",
      },
      {
        citation: 'Nunes & Drèze (2006). The Endowed Progress Effect.',
        venue: 'Journal of Consumer Research 32(4), 504–512',
        url: 'https://doi.org/10.1086/500480',
        finding: 'A goal that starts part-done is finished far more often.',
        inGame:
          'Words you get right in the check-up before playing them count as known from the start.',
      },
      {
        citation: 'Csikszentmihalyi (1990). Flow: The Psychology of Optimal Experience.',
        venue: 'Harper & Row (book)',
        url: null,
        finding: 'People stay absorbed when the challenge matches their skill.',
        inGame: "Word mode's levels, which speed up with the combo.",
      },
      {
        citation:
          'Sweetser & Wyeth (2005). GameFlow: A Model for Evaluating Player Enjoyment in Games.',
        venue: 'Computers in Entertainment 3(3)',
        url: 'https://doi.org/10.1145/1077246.1077253',
        finding:
          'Flow turned into criteria for games: clear goals, feedback, challenge matched to skill.',
        inGame: 'Instant feedback on every answer, with the fix shown after a miss.',
      },
    ],
  },
  {
    heading: 'The streak and reminders',
    sources: [
      {
        citation: 'Kahneman & Tversky (1979). Prospect Theory: An Analysis of Decision under Risk.',
        venue: 'Econometrica 47(2), 263–291',
        url: 'https://doi.org/10.2307/1914185',
        finding: 'A loss weighs about twice as much as an equal gain.',
        inGame: 'The streak: something to keep. The bank run’s pot works the same way.',
      },
      {
        citation: 'Fogg (2009). A Behavior Model for Persuasive Design.',
        venue: 'Persuasive Technology 2009',
        url: 'https://doi.org/10.1145/1541948.1541999',
        finding: 'A behaviour happens when motivation, ability and a prompt come together.',
        inGame: 'The streak reminder on the start screen is the prompt.',
      },
      {
        citation: 'Eyal (2014). Hooked: How to Build Habit-Forming Products.',
        venue: 'Portfolio (book, not peer-reviewed)',
        url: null,
        finding: 'A habit loop: prompt, action, an unpredictable reward, then something invested.',
        inGame: 'The haiku collection, the play calendar and words known are the investment.',
      },
      {
        citation:
          'Yancey & Settles (2020). A Sleeping, Recovering Bandit Algorithm for Optimizing Recurring Notifications.',
        venue: 'KDD 2020 (Duolingo)',
        url: 'https://research.duolingo.com/papers/yancey.kdd20.pdf',
        finding:
          'Reminders work best picked from templates that fit the learner, with recently sent ones held back.',
        inGame:
          'How the streak reminder is chosen: only messages that fit, never the same one twice running.',
      },
    ],
  },
  {
    heading: 'Learning that sticks',
    sources: [
      {
        citation:
          'Cepeda, Pashler, Vul, Wixted & Rohrer (2006). Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis.',
        venue: 'Psychological Bulletin 132(3), 354–380',
        url: 'https://doi.org/10.1037/0033-2909.132.3.354',
        finding:
          'Practice spread over days is remembered far better than practice crammed together.',
        inGame:
          'The daily deck and the review boxes, and why the streak asks for a little every day.',
      },
      {
        citation:
          'Settles & Meeder (2016). A Trainable Spaced Repetition Model for Language Learning.',
        venue: 'ACL 2016 (Duolingo)',
        url: 'https://doi.org/10.18653/v1/P16-1174',
        finding: 'Scheduling each word’s review by how fast it is forgotten improves recall.',
        inGame: 'Words come back on a schedule, sooner for the ones you miss.',
      },
      {
        citation:
          'Hamari, Koivisto & Sarsa (2014). Does Gamification Work? A Literature Review of Empirical Studies on Gamification.',
        venue: 'HICSS 2014',
        url: 'https://doi.org/10.1109/HICSS.2014.377',
        finding: 'Game elements mostly help, but how much depends on the setting and the users.',
        inGame: 'Why each game element here is tied to learning, not added for its own sake.',
      },
      {
        citation:
          'Quantifying Cognitive and Affective Impacts of Quizlet on Learning Outcomes: A Systematic Review and Comprehensive Meta-Analysis (2024).',
        venue: 'Open access on PubMed Central',
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10951395/',
        finding:
          'Game-style flashcards had moderate effects on learning vocabulary (g = 0.62) and keeping it (g = 0.74).',
        inGame: 'Word and kanji modes are game-style flashcards.',
      },
    ],
  },
];
