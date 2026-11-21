# Phase 1: Problem brief

**Project:** juku-arcade (working name), an arcade-style card game for
learning Japanese words and their kanji readings. It is a web app, owned by
Arthur, and its first user is a friend's company that teaches Japanese.

**Status (2026-11-21):** planning only. Arthur hasn't met his friend yet,
so everything about the learners is still open (see "Open questions"). The
core loop below is Arthur's design, refined with him on 2026-11-21.

## The problem

Learning Japanese means learning thousands of words, and for each one its
kanji spelling and its reading. 学校 is read がっこう. That takes a lot of
repetition, spread over days. Repetition is boring, so learners stop.

- Flashcard apps do the spacing well, but they feel like homework.
- Games are fun, but most don't schedule reviews, so the words don't
  stick.
- The school wants something its learners **come back to every day by
  choice**.

## What we'll build

A card game you can play for 2 minutes or 20. There's no game over.

1. **A board of cards.** The top row has 5 word cards in kanji (学校). The
   bottom row has 6 reading cards (がっこう): the 5 answers plus a decoy.
2. **Match them.** Tap a word, then its reading. A match flies off and
   adds 1 to your combo. When all 5 are matched, a new set deals in.
3. **Pressure.** Each set has a timer. Every 10 combo raises the level,
   from 1 to 5, and each level gives less time: 40 seconds per set at
   level 1, 12 seconds at level 5.
4. **Mistakes.** A wrong tap resets the combo to 0 and drops you one
   level. At level 5 it sends you back to level 1. The right answer
   flashes, and the word comes back soon.
5. **Score.** Each word card has a small difficulty tag, such as +0.2×.
   The tags of a set's clean matches stack into the set's multiplier, so
   hard words are worth more. The game learns which words are hard for
   you.
6. **Pause and flip.** Pause freezes the game. You can then flip any card
   to see its meaning and an example. A card you peek at scores nothing,
   and it comes back for review.
7. **Why come back:** a short daily deck of the words due for review plus
   a few new ones, a calendar of the days you played, and your best combo
   and best set to beat.

Behind the game, a **review engine** decides which words come up and when.
It's the same kind of engine as Juku's: missed words come back sooner and
known words come back later. It sits behind a small interface shaped like
Juku's, so after a playtest the game can switch to Juku's API.

## Why it's worth building (portfolio)

- **It measures learning, not just fun.** An optional daily check-up
  tests each word before you first play it and again after. A random set
  of held-back words controls for the check-up's own effect. So the game
  can say whether play improves recall (see the measurement plan).
- **The difficulty learns.** Each word's tag starts from data (JLPT level,
  kanji frequency, irregular readings) and moves with the player's own
  misses. We measure whether the learned tag predicts misses better than
  the starting guess.
- **It turns play into decisions.** The score is only for motivation.
  The detailed log behind it shows where learners struggle: which words,
  which confusions, which kinds of error (long vowels, small っ, look-alike
  kanji). Reports start from the school's decisions, such as what to
  re-teach this week and who may need help.
- **It reuses Arthur's work:** the same open word data as Juku
  (OpenJLPT), and Juku's review scheduling, ported to the browser.

## In scope now

- Kanji-to-reading matching for JLPT words, N5 first.
- The loop, scoring, pause and peek, daily deck, review engine and
  check-up, all in the browser with no server.
- A barebones way for the school to get anonymous data out: an export
  file, and a script that writes a class report, ability reports per
  learner and the measurement report.

## Not in scope now

- **Grammar (bunpou).** Arthur's call (2026-11-21): grammar is harder than
  matching cards, so it's planned after the playtest. A candidate design is
  recorded in the decisions (D11).
- **An admin backend.** It will be barebones for now (D18). A tiny backend
  may come after the playtest.
- Accounts, payments, ads, native apps, and leaderboards with names.

## Limits

- **Original.** The genre is card hands with score combos, and the game
  owes nothing else to any existing game: not a name, card design, joker,
  scoring table or look (D22).
- **Learners' wellbeing.** No pay-to-win and no loot boxes. A soft
  reminder to stop after 15 minutes, and a daily cap if minors play (D19).
- **Licensed content.** Open data only (OpenJLPT, CC BY-SA 4.0). The
  school's own lists can come in later, if the school owns them. No lists
  copied from commercial textbooks.
- **$0.** Static hosting on a free tier, and no paid services.
- **Never touch Arthur's running Juku stack** (`juku-rehearsal`).

## Open questions (for the meeting with the friend)

| Topic | Question | Why it matters |
|---|---|---|
| Learners | Ages? Any minors? JLPT levels? How many? | The minors cap (D19), which decks ship first |
| Content | Do they have their own word lists, and do they own them? | Import format, licence |
| Use | In class, homework or free time? Phone or laptop? | Session length, layout priority |
| Language | Which language for menus and meanings: English or Indonesian? | OpenJLPT meanings are English |
| Success | What would make them call it a success? | Adds to the measurement plan |
| Decisions | What would teachers and managers decide with this data, and how often? Weekly? Per term? | The decision report (phase 3) is built around their answers |
| Learner privacy | Is class-level data enough, or do teachers need to know which learner is which? Who collects consent for minors? | Whether learners share their anonymous ID with the teacher (N5) |
| Measurement | Will they ask learners to do the check-up and export their stats? Would they compare with a class that doesn't play? | The headline measure needs check-up data |
| Deal | Free or paid? Can Arthur show it in his portfolio? Their branding? Deadline? | Public repo or private; slice order |
