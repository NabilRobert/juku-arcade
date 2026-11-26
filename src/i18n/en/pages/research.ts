/**
 * The research page (ResearchPage.vue, research/sources.ts): each group's
 * heading, and what each source found and where the game uses it. Paper
 * titles, authors and venues stay in sources.ts, as a reference list writes them.
 */
export const research = {
  title: 'The research',
  intro:
    "The ideas the game is built on, and where they come from. These back the design's ideas; none of them studied this game.",
  inGame: 'In juku-arcade: {use}',
  venueNotes: {
    book: '{venue} (book)',
    bookNotPeerReviewed: '{venue} (book, not peer-reviewed)',
    openAccess: 'Open access on {venue}',
  },
  groups: {
    comingBack: 'Why players come back',
    compelling: 'What makes play compelling, and where it tips into harm',
    goals: 'Goals and progress',
    streak: 'The streak and reminders',
    learning: 'Learning that sticks',
  },
  sources: {
    ryan2006: {
      finding:
        'Feeling capable, free to choose and connected to others each predicted enjoyment and future play.',
      inGame: 'Level goals and ranks, a choice of modes, and the leaderboard.',
    },
    przybylski2010: {
      finding:
        'Games that meet those needs bring players back in a healthy way; obsessive play comes from pressure instead.',
      inGame: 'Why the 15- and 30-minute nudges and the daily cap stay.',
    },
    king2010: {
      finding:
        'A checklist of what draws players in: social features, presentation, control, story, and rewards and punishments.',
      inGame: 'The base the design was checked against.',
    },
    ferster1957: {
      finding: 'Rewards that come unpredictably hold behaviour most strongly.',
      inGame: 'The shop turning up 1 time in 3, omikuji gifts, and which haiku a show closes on.',
    },
    schultz1997: {
      finding: 'Dopamine responds to rewards that are better than expected, not to expected ones.',
      inGame: 'Why surprises (crests, the shop) feel better than fixed rewards.',
    },
    berridge1998: {
      finding: 'Wanting and liking are separate systems; compulsion is wanting without liking.',
      inGame: 'The warning sign the design avoids: no paid or random rewards.',
    },
    clark2009: {
      finding: 'Just missing a goal makes people want to try again, almost as much as winning.',
      inGame: 'Results that show how close a run came to your best.',
    },
    kivetz2006: {
      finding: 'People speed up as a goal gets closer.',
      inGame: "Today's deck as a daily goal, and progress toward knowing a level's words.",
    },
    nunes2006: {
      finding: 'A goal that starts part-done is finished far more often.',
      inGame:
        'Words you get right in the check-up before playing them count as known from the start.',
    },
    csikszentmihalyi1990: {
      finding: 'People stay absorbed when the challenge matches their skill.',
      inGame: "Word mode's levels, which speed up with the combo.",
    },
    sweetser2005: {
      finding:
        'Flow turned into criteria for games: clear goals, feedback, challenge matched to skill.',
      inGame: 'Instant feedback on every answer, with the fix shown after a miss.',
    },
    kahneman1979: {
      finding: 'A loss weighs about twice as much as an equal gain.',
      inGame: 'The streak: something to keep. The bank run’s pot works the same way.',
    },
    fogg2009: {
      finding: 'A behaviour happens when motivation, ability and a prompt come together.',
      inGame: 'The streak reminder on the start screen is the prompt.',
    },
    eyal2014: {
      finding: 'A habit loop: prompt, action, an unpredictable reward, then something invested.',
      inGame: 'The haiku collection, the play calendar and words known are the investment.',
    },
    yancey2020: {
      finding:
        'Reminders work best picked from templates that fit the learner, with recently sent ones held back.',
      inGame:
        'How the streak reminder is chosen: only messages that fit, never the same one twice running.',
    },
    cepeda2006: {
      finding: 'Practice spread over days is remembered far better than practice crammed together.',
      inGame:
        'The daily deck and the review boxes, and why the streak asks for a little every day.',
    },
    settles2016: {
      finding: 'Scheduling each word’s review by how fast it is forgotten improves recall.',
      inGame: 'Words come back on a schedule, sooner for the ones you miss.',
    },
    hamari2014: {
      finding: 'Game elements mostly help, but how much depends on the setting and the users.',
      inGame: 'Why each game element here is tied to learning, not added for its own sake.',
    },
    quizlet2024: {
      finding:
        'Game-style flashcards had moderate effects on learning vocabulary (g = 0.62) and keeping it (g = 0.74).',
      inGame: 'Word and kanji modes are game-style flashcards.',
    },
  },
};
