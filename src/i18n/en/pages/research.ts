/**
 * The research page (ResearchPage.vue, research/sources.ts): each group's
 * heading, and for each study the claim the game rests on, a plain-English
 * paragraph on what the study did and found, where in the paper the claim
 * is, and where the game uses it. They follow the client quote's section
 * 2f, caveats included. Paper titles, authors and venues stay in
 * sources.ts, as a reference list writes them.
 */
export const research = {
  title: 'The research',
  intro:
    "The studies the game's design is built on. They explain why the game works the way it does; none of them studied this game, and they're no guarantee of learning results or exam scores.",
  where: 'Where in the paper: {where}',
  freeCopy: 'Free copy (PDF)',
  inGame: 'In juku-arcade: {use}',
  groups: {
    learning: 'Learning that sticks',
    motivation: 'Why game elements help',
    goals: 'Goals and progress',
    streak: 'The streak',
    sound: 'Sound that stays out of the way',
  },
  sources: {
    cepeda2006: {
      finding:
        'Study spread out over time is remembered longer than the same study crammed together.',
      summary:
        "This isn't one experiment but a review that pooled 317 experiments from 184 articles on remembering words, word pairs and facts. In each, some people studied an item several times in a row and others studied it with gaps in between. The spaced groups remembered more on the final test, and the longer people had to remember, the longer the best gap was. It backs spacing in general; the game's growing gaps follow that last finding but aren't tested in the paper.",
      where: 'p. 358, "Spacing Effects: Massing Versus Spacing", 2nd paragraph.',
      inGame:
        'The daily deck and the review boxes: a word comes back after a gap, not ten times in one sitting.',
    },
    roediger2006: {
      finding: 'Testing yourself beats rereading for long-term memory.',
      summary:
        'University students read short passages. One group read a passage four times; another read it three times and then wrote down all they remembered; a third read it once and did that recall test three times, with no feedback. Five minutes later the rereaders did best (83% against 71%). A week later it flipped: the tested group remembered 61% and the rereaders 40%, even though the rereaders felt more confident.',
      where: 'p. 249, abstract; p. 253, "General Discussion", 1st paragraph.',
      inGame: 'Every card asks for an answer; there is never one just to read.',
    },
    hattie2007: {
      finding:
        'Feedback is among the strongest influences on learning, especially feedback that shows what was right and what was wrong.',
      summary:
        "A review, not an experiment: it pooled 12 earlier meta-analyses covering 196 studies of feedback in classrooms. The average effect was about twice that of a typical school influence. The authors stress that feedback can also hurt: it works best when it's about the task (what was right, what was wrong and how to fix it) and worst when it's only praise.",
      where: 'p. 81, abstract, 1st sentence; p. 91, "Feedback About the Task", 1st paragraph.',
      inGame: 'A miss shows the right answer at once, and the word comes back soon after.',
    },
    sailer2020: {
      finding:
        'Game elements have small but significant positive effects on learning, motivation and behaviour.',
      summary:
        'A meta-analysis of experiments that compared a gamified lesson with the same lesson without game elements. Gamification helped learning (19 comparisons, 1,686 learners), motivation (16 comparisons, 2,246 learners) and learning behaviour (9 comparisons, 951 learners). The authors call these effects small but significant. The effect on learning held in the most careful studies; the effects on motivation and behaviour were less steady. It backs game elements in general, without promising big results.',
      where: 'p. 77, abstract.',
      inGame: 'Combos, coins, levels and the leaderboards.',
    },
    ryan2006: {
      finding: 'Games appeal because they make players feel capable and free to choose.',
      summary:
        'Four studies. In the first three, university students played one, two or four games in a lab and said how capable and how free to choose they felt; those feelings predicted how much they enjoyed a game, whether they wanted to play it again, and how their mood changed. The fourth surveyed an online community of multiplayer gamers, where feeling capable, free to choose and connected to others each predicted enjoyment and future play.',
      where: 'The abstract, and "General discussion", 2nd paragraph.',
      inGame: 'You pick your own mode, and the difficulty follows your skill.',
    },
    kivetz2006: {
      finding: 'People try harder as they near a goal.',
      summary:
        'At a university café, customers had a stamp card: buy 10 coffees, get one free. The closer they got to the free coffee, the sooner they came back for the next one. A second study found the same with people rating songs online for reward vouchers: they visited more often and rated more songs as the reward got close. A 12-stamp card that came with 2 free stamps was also finished faster than a plain 10-stamp card, so the feeling of progress alone speeds people up.',
      where: 'p. 39, abstract, findings (1) and (2).',
      inGame:
        'The JLPT goal bar, with a mark at each quarter, and results that compare a run with your best.',
    },
    silverman2023: {
      finding:
        'An unbroken streak keeps people coming back, a broken one makes them stop, and being able to repair a break softens that.',
      summary:
        "Seven studies. The first used real step counts from a university walking challenge; the rest were lab studies with apps for exercise, language learning and games. People who had done exactly the same amount were more likely to carry on when their log showed an unbroken streak than a broken one. The effect grew when people blamed themselves for the break and shrank when they could repair it: in the game study, 93% carried on with an unbroken streak, 69% with a broken one and 85% with a broken one they could repair. The game's weekly rest day is like a repair, but it isn't what the study tested.",
      where:
        'The abstract (journal p. 1095); repair is Study 7. The free copy is the accepted manuscript, so its pages differ: the abstract is on p. 3 and Study 7 on p. 43.',
      inGame: "The play streak, which one rest day a week doesn't break, and the play calendar.",
    },
    moreno2000: {
      finding: 'Background sound unrelated to the lesson reduces learning.',
      summary:
        'Two experiments. Students watched a short narrated animation on how lightning forms or how car brakes work; some versions added background music, some sound effects, some both and some neither. Students with background music remembered less and solved fewer problems than those without, and both together did worst. The explanation is that extra sound competes with the narration for the same limited listening memory. The game has no narration, so this is a reason for care rather than a direct test.',
      where: 'p. 117, abstract.',
      inGame:
        'The music starts quiet, under the sound effects, has its own volume slider, and can be turned off.',
    },
  },
};
