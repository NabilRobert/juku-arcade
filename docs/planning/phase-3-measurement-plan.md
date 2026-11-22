# Phase 3: Measurement plan

Fixed on 2026-11-21, before any code. If it changes later, the change and
its reason are added at the bottom, and the old text stays.

## The headline question

**Does playing juku-arcade improve learners' recall of word readings?**

Running a class study is out of scope (2026-11-21). So the
measure is built into the game, through the optional daily check-up
(phase 2, C1–C4). It compares each player with themselves, using a random
control, so no class that doesn't play is needed.

## How it works, in plain words

Every word gets a quick **before** question just before it first enters
play. That shows whether the player already knew it.

Then each word is randomly sent one of two ways:
- **Played** (2 in 3): it enters the game as normal. At least a day after
  its first play, it gets an **after** question.
- **Held back** (1 in 3): it waits 3 days without being played. In that
  time it gets a **held-back** question, then it enters play.

A held-back word has had a before question and some time pass, but no
play. A played word has had the same plus play. So the difference between
the two shows what **play** adds, beyond the check-up itself and beyond
what the learner picked up elsewhere, such as class.

## The numbers

All are shares of correct answers, pooled over players.

| Name | What it is |
|---|---|
| **B** (before) | Correct on before questions |
| **A** (after) | Correct on after questions (played words, at least 1 day after first play) |
| **H** (held back) | Correct on held-back questions (at least 1 day after the before question, no play yet) |
| **Play effect** | **A − H**, in percentage points. **This is the headline.** |
| Raw gain | A − B (reported, but not the headline: it mixes play with time and class) |

The chance level is 25%, since each question has 4 options.

**Uncertainty:** a 95% bootstrap confidence interval (CI) for A − H.
Players are resampled, not answers, because one player's answers aren't
independent. 10,000 resamples.

## Success, fixed now

- **Play works** if A − H is at least **+15 points** and its 95% CI is
  above 0.
- **Too early to tell** if the CI includes 0, or if there's less data
  than the minimum below. We report "not enough data" and no number.
- **Play doesn't help recall** if the CI is entirely below +5 points. Then
  the loop is training speed or matching tricks, not memory. The response
  would be slower top levels, recall-style cards, or longer gaps.

**Minimum data before reporting:** at least 5 players, 200 after-answers
and 100 held-back answers in all. At 5 questions a day, that's 2 after-
and 1 held-back answer per check-up: about 7 players doing the check-up
on 14 days.

Why +15 points: a 4-choice test leaves room between chance (25%) and a
ceiling. A gain smaller than about 10 points wouldn't be worth the
learners' time over plain flashcards, and +15 points over 2 weeks is a
clear effect for a teacher to see. It's a judgement, set before the data,
which is the point.

## Secondary measures

From the same export (A1) and summary script (A2).

| # | Measure | Target or use |
|---|---|---|
| S1 | **Coming back:** days played out of the first 14; share of players back on day 2 and day 7 | Describes the pull. No target until we know the school's usage |
| S2 | **Daily deck completion:** share of days played on which the deck was cleared | Tells us whether the deck size is right |
| S3 | **Difficulty learns:** does the learned miss chance (R5) predict the next attempt better than the starting guess? Log loss on later attempts not used to fit | The learned tag beats the guess by at least 5% log loss. Otherwise the tag is decoration, so keep the guess or simplify |
| S4 | **Loop balance:** timeouts per level; misses per level; how often level 5 drops to 1, and whether the player quits within the next 2 sets | Fewer than 40% of level-5 sets time out. A quit right after 5→1 more than 30% of the time means that rule is too harsh |
| S5 | **Peeks:** peeks per set, and peeked words' later recall | Shows whether pause and flip helps learning or is avoided |
| S6 | **Check-up uptake:** share of play days with a check-up | Below 30% means the headline will be thin; tell the school early |

## Decision report: data for the people who decide

The data is there to help decision makers decide,
and to show where learners struggle. So every report section starts from
a decision, not from a chart. A school using the game confirms this
list (phase 1, open questions).

| Who | Decision | Evidence in the report | When it flags |
|---|---|---|---|
| Teacher | What to re-teach this week | The class's 10 most-missed words; its most common confusions (学校 ↔ 学生); error types as a share of misses | A word missed by at least 40% of the learners who met it, with at least 5 learners |
| Teacher | Who might need help | By anonymous ID: words known per week, accuracy trend, days since last play | Accuracy falling 2 weeks running, or no play for 7 days |
| Teacher | Which skill to drill | Error types per class, for example "long vowels: 32% of misses" | A type with twice the miss rate of the others, at the same number of decoy tests |
| Curriculum lead | Which words are harder than their level suggests | Class difficulty (R5, pooled) next to the JLPT level | A word in the hardest 10% of a level that sits a level easier |
| Curriculum lead | Is the class ready for the next level? | Words known as a share of the level's deck, as the median and spread across the class | — (shown, not flagged) |
| School leadership | Keep using the game? | The headline (play effect), S1 coming back, and the wellbeing guardrails | The headline's success or failure rule, above |
| Learner | What to study next | In the game: words known (R7), and their own weak words when paused | — |

**Reporting rules:**
- Every figure shows how many learners and answers it rests on.
- Figures about a word or a class need at least 5 learners. Below that,
  the report says "too few learners" instead of a number, so nobody acts
  on noise and no single learner can be picked out.
- Reports rank words and skills, never learners against each other.
- Confusions with a decoy and mix-ups between two real words are reported
  separately (R6 `wrong_card_role`). Decoy confusions show which error
  types learners fall for. Real mix-ups show which pairs of words get
  confused.
- Each flag says what it suggests ("consider re-teaching 学校, 学生 and
  先生: the 学 readings"), and the evidence sits next to it.

## Wellbeing guardrails

These are watched as closely as success:
- median session length at most **20 minutes**;
- the share of sessions over **45 minutes**, reported each week. If it's
  rising, the nudge needs work;
- how often the 15-minute nudge leads to stopping, compared with being
  dismissed;
- if the minors cap is on: no session for a capped player goes past the
  cap.

## Checking the pipeline before real data

The summary script is tested on **simulated players** before the
playtest. Each simulated player has a known chance of recall per word,
plus a planted play effect (for example +20 points), and answers through
the same event format. The script must recover the planted effect within
its CI. With a planted effect of 0, it must say "not enough data" or give
a CI that includes 0.

That's a test helper, so plain code is fine.

## Where the data comes from

- Everything is logged in the browser (R4), with anonymous random player
  IDs and no names.
- The school asks players to press "Export" (A1) and send the file. The
  summary script (A2) reads a folder of files.
- Learners are told, in plain words on the export screen, what the file
  contains.

## Not measured (and why)

- **A class that doesn't play:** that's the school's choice. If they want
  it, the same check-up can run for a class that doesn't play the game.
  The analysis compares A with that class's after-scores. Optional, and not
  planned.
- **Exam results:** too far from the game, and too slow.
- **Grammar:** not in this phase (D11).

## Threats to the result

| Threat | How it's handled |
|---|---|
| The check-up itself teaches | The held-back control has the same check-up without play |
| Learners also study in class | It affects played and held-back words alike, so it cancels out in A − H |
| Only keen learners do the check-up | Reported as S6. The result applies to check-up takers only, and the report says so |
| The decoy and options teach elimination | Check-up options are chosen separately from the game's decoys (C5) |
| A and H have different delays | Both are at least 1 day. The summary reports the median delay of each |
| Small numbers | The minimum data rule, plus CIs, plus "not enough data" with no number |

## Changes after building the report script (slice 5b, 2026-11-21)

The text above stays as fixed. These notes add to it.

1. **"About 7 players" was slightly short.** 7 players × 14 days × 2
   after-answers is 196, under the 200 minimum. It takes **8 players** on 14
   days (or 7 on 15).
2. **How often a real effect is detected** (`npm run power`: simulated
   classes with a planted +20-point effect, 40 classes per size, 14 days):

   | Players | "Play works" | Not enough data |
   |---|---|---|
   | 7 | 0 of 40 | 40 of 40 |
   | 8 | 36 of 40 | 0 of 40 |
   | 12 | 34 of 40 | 0 of 40 |
   | 20 | 36 of 40 | 0 of 40 |
   | 30 | 38 of 40 | 0 of 40 |

   Once the minimum data exists, a real +20 effect is called "play works"
   about 85–95% of the time. The rest come out "too early to tell", never as
   "doesn't help". The success rule is unchanged.
3. **Re-teach flags use the share of answers missed**, not the share of
   learners who missed a word at least once. Over two weeks nearly every
   learner misses nearly every word once, so the learner-based rule flagged
   words missed only 1 time in 10. The threshold stays 40%, with at least 5
   learners.
4. **Error-type exposure is now logged.** Dividing misses by how often each
   type was shown needed a record of what was shown. Each set now logs a
   `deal` event with its decoy type. Exports from before this change report
   "exposure unknown" instead of a rate.
