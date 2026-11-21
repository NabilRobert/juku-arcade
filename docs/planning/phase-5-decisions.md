# Phase 5: Decisions

Each decision lists the options it beat. **Settled** means Arthur chose
it, in this session on 2026-11-21. **Recommended** means it still needs
his OK. Requirement numbers (L1, R2…) point to phase 2.

## Reuse first

| Need | Reused | Built here |
|---|---|---|
| Word data | **OpenJLPT** at commit `bf4e1ee`, as in Juku (ADR-003) | A build script that writes per-level decks (D15) |
| Review scheduling | **Juku's Leitner engine** (`juku-agents` `packages/juku-data/src/juku_data/engine/state.py` at `4e6c409`), ported to TypeScript | The port, about 40 lines, credited in its commit (D13) |
| Option picking for the check-up | Juku's quiz option rule (`engine/quiz.py`: same level, similar reading) | The TypeScript version |
| Attribution wording | Juku's `about_the_data.md` | — |
| UI, state, tests | Vue 3, Pinia, Vitest (Arthur's stack) | — |
| Animation | Motion for Vue (MIT) | — |
| Browser storage | Dexie (Apache-2.0) | — |
| Sound | CC0 sound packs (for example Kenney's) | — |
| The loop, scoring, difficulty model, check-up design | — | **Built:** this is what the project demonstrates |

Juku is Python and its repo is private, so the game can't depend on it
directly. Porting a small, pure function is the lighter option (D13).

## The loop

### D1: A pair board of 5 words and 6 readings (settled)

The top row has 5 kanji word cards and the bottom row 6 reading cards,
one of them a decoy. Tap the two cards of a pair.

- **Beat:** one reading at a time with a hand of 5 kanji cards (a steady
  stream, with less of a "set" feel); dragging a reading onto its card
  (fiddly on phones).
- **Decoy, beat:** 5 and 5 (the last match of every set is free by
  elimination, which inflates combos); decoys only from level 3 up (the
  rules change mid-run).

### D2: Level rules (settled)

+1 level each time the combo reaches a multiple of 10, up to level 5. A
miss drops the level by one, but at level 5 it drops to level 1.

- **Beat:** back to level 1 on any miss (harsh: one slip costs 40 matches
  of climbing); the level never drops (long runs get stuck at level 5's
  speed).
- Arthur's twist makes level 5 a high-stakes spot. S4 watches whether the
  drop from 5 to 1 makes players quit.

### D3: The set timer (settled)

40 / 30 / 22 / 17 / 12 seconds per set at levels 1–5, tuned in playtest.

- **Beat:** gentler (50 down to 18 s); harsher (30 down to 8 s, which
  tests reading speed more than memory).

### D4: Timeouts break the combo, not the memory (settled)

A timeout resets the combo and drops the level, but unmatched words are
not recorded as forgotten.

- **Beat:** treating timeouts as wrong answers (fast levels would flood
  reviews with words the player knows); nothing happens on a timeout (the
  timer stops mattering).

### D5: Set score with stacking card tags (settled)

`chips × multiplier`. Chips are 10 per clean match plus 1 per second
left. The multiplier is `level × (1 + the sum of the clean matches'
tags)`. The tags stack by adding up within a set (Arthur: "multipliers
can stack"), and the level multiplies the total. The worked example is in
L7.

- **Beat:** combo and level only (no payoff moment when a set clears); a
  run total (rewards time played over playing well).
- Tags add rather than multiply, because multiplying five tags
  (1.2 × 1.3 × …) makes scores swing wildly from set to set.

### D6: Difficulty tags that learn (settled)

Each word starts from a guess (JLPT level, kanji frequency, irregular
reading), then moves with the player's own misses:
`(misses + 5 × guess) / (attempts + 5)`. The result maps to a tag from
+0.1× to +0.5×.

- **Beat:** the whole class's misses from day one (needs a backend first,
  and new words have no data); fixed tags (drops the learning Arthur
  wants).
- Pooling the class's misses can come with a backend, later. S3 checks
  that the learning beats the guess.

### D7: A wrong tap shakes, shows the answer, and play continues (settled)

The correct reading flashes, and the pair stays on the board to be
matched. The word returns within 2 sets.

- **Beat:** locking the card for a second with no hint; removing and
  revealing the pair automatically (the player never makes the right
  match).

### D8: Pause freezes the game, and flipping is for learning (settled)

The pause button freezes the game without opening a menu, and any card
can be flipped for its details. A peeked word scores nothing, doesn't
break the combo, and counts as a review miss. A missed tray holds this
run's last 8 misses.

- **Beat:** showing only the meaning for unmatched cards (you can't check
  a reading you're unsure of); flipping with no penalty (combos stop
  meaning anything).
- **Settled (Arthur's OK):** hide the card faces while paused (L9).
  Otherwise pausing gives unlimited thinking time.

### D9: Daily deck plus bests (settled)

Each day: the reviews due plus 10 new words. Clearing them ticks the
calendar, and the bests are best combo and best set.

- **Beat:** best combo only (nothing brings you back the next day);
  a session score (rewards long sessions).
- **Settled detail:** show "days played out of the last 7" rather
  than a streak that resets, so a missed day doesn't make anyone anxious.

### D10: Endless play mixes weak words with a few new ones (settled)

Endless play weights the words missed most, plus about 1 new word per
set. A word moves up the review schedule at most once a day.

- **Beat:** only new words (races through the list without making it
  stick); only seen words (gets stale).

### D11: Grammar comes later (settled: deferred)

Arthur: grammar is "more complicated than just matching cards". It comes
after the playtest. The **leading candidate** to revisit then is **gap
sentences** on the same board: 5 short sentences with a gap, and the
particle or verb form for each gap. Each set is built so that every answer
fits exactly one sentence. OpenJLPT has 526 grammar points with Tatoeba
examples to draw from.

- **Also considered:** a pattern matched to its meaning (easy content,
  but it only tests recognition; maybe an easy mode); matching sentence
  halves (often several endings fit).

## Build

### D12: Vue 3, TypeScript, Vite, Tailwind, Motion for Vue, Pinia, Vitest (settled: Arthur's OK, 2026-11-21)

The cards are ordinary page elements, so the Japanese text stays sharp
and the cards are easy to test. Motion sequences the deal, flip, fly-off
and combo effects.

- **Beat:** PixiJS or Phaser on a canvas (overkill for 11 cards, harder
  Japanese text and tests, and outside the stack); CSS transitions only
  (sequenced effects get fiddly by hand).
- **Rule split:** the game rules (L2–L8) live in plain TypeScript in
  `src/game/`, with no Vue. They're unit-tested on their own, and Vue only
  draws them.

### D13: Port Juku's Leitner engine behind a Juku-shaped interface (settled: Arthur's OK, 2026-11-21)

- **Beat:**
  - **ts-fsrs** (MIT): a better scheduler, but it differs from Juku, so
    moving to Juku's API later would change how the game behaves;
  - **depending on Juku:** it's Python and private, so it can't run in a
    browser;
  - **a new scheduler:** no reason to write one.

### D14: Event log in IndexedDB through Dexie (settled: Arthur's OK, 2026-11-21)

- **Beat:**
  - **localStorage:** a 5 MB cap and blocking calls, which suits a log of
    events badly;
  - **idb:** smaller and lower-level. A fair alternative if bundle size
    gets tight.

### D15: Decks generated from pinned OpenJLPT at build time (settled: Arthur's OK, 2026-11-21)

A TypeScript script reads OpenJLPT's SQLite file with Node's built-in
`node:sqlite` (Node 22.13+), checks the checksum, applies L2's rules, and
writes the deck files. The script also counts how many words per level
pass L2, which is slice 0's spike.

- **Beat:**
  - committing the generated JSON (generated bulk, against the repo
    rules);
  - reusing Juku's Python reader (private repo, and an extra language);
  - waiting for the school's lists (blocks all content);
  - **better-sqlite3:** the fallback if `node:sqlite` falls short.

### D16: Measure within each player, with a random held-back control (settled in substance)

Arthur chose the built-in check-up and no class study. The held-back
control is how the check-up can answer the headline on its own (phase 3).

- **Beat:** a class that doesn't play (the school's job; optional); game
  stats only (speed and memory mixed, and no control); the school's own
  tests (timing, and they may not cover our words).

### D17: Check-up of 5 questions, 4 options, 8 seconds, optional and daily (settled)

- **Beat:** typing kana (true recall, but slow and error-prone on
  phones); 20 questions weekly (easier to skip, and fewer data points).

### D18: Admin is barebones: an export and a script (settled)

Arthur: "don't plan the admin things yet", and keep it "barebones". So:
an anonymous JSON export plus a summary script (A1, A2). A tiny backend
(Cloudflare Worker with D1) may come after the playtest. It isn't planned
here.

- **Beat:** using Juku's server (Juku is paused, so this would block on
  it); a backend now (not needed to learn whether the loop works).

### D19: Wellbeing: a 15-minute nudge, a cap if minors play, and a never-list (settled)

The cap is a deploy setting, not an admin screen (barebones).

- **Beat:** a nudge only (not enough for children); a hard cap for
  everyone (patronising for adults).

### D20: Static hosting on Cloudflare Pages' free tier (settled: Arthur's OK, 2026-11-21)

The same platform as Framed, with a preview build per branch, and room
for a Worker later.

- **Beat:** GitHub Pages (fine, but no custom headers and no preview per
  branch); a self-managed server (a static game needs no server to
  maintain).

### D21: Licences (settled: MIT once the school confirms ownership)

The data is CC BY-SA 4.0, as OpenJLPT requires, with attribution. The
code licence is Arthur's choice. MIT is suggested, but wait for the
friend's answer on ownership.

### D22: Original, with genre inspiration only (settled)

"Card hands with score combos" is a genre. juku-arcade has its own name,
card design and scoring formula (D5). It has no jokers, shop, poker hands
or card art from any existing game. Every visual is checked against this
before it ships.

### D23: Sound is a Could (settled: Arthur's OK, 2026-11-21)

CC0 sounds only, muted until the first tap. Sound is first on the cut
list.

### D24: System fonts for Japanese (settled: Arthur's OK, 2026-11-21)

- **Beat:** a Noto Sans JP webfont (OFL licence, but megabytes before
  subsetting, which works against N1).

## Data for decisions (added 2026-11-21, after Arthur's review)

### D25: The score motivates, and the data measures (settled)

Arthur noticed that per-player tags make scores meaningless as a measure
of ability. That's by design: the score is a personal motivator, never
compared between players. Ability comes from the event log, "words known"
(R7) and the check-up.

- **Beat:** fixed tags, so scores could be compared (that drops the
  learning tags, and invites leaderboards, which D19 rules out); hiding
  the score (that drops the arcade payoff).

### D26: Detailed, anonymous events from slice 1 (settled)

Every event carries the full field list in R6. Events that weren't logged
can never be recovered, but reports can be built at any time. So detail
is captured from the start, and reporting stays barebones (D18).

- **Beat:** logging only outcomes (no confusions, speed or context, so
  the struggle insight is impossible); logging names to make follow-up
  easier (a privacy risk, especially for minors; the school can map IDs
  itself, N5).

### D27: Decoys that test error types (settled: Arthur's OK, 2026-11-21)

Each set's decoy tests one error type (R8). Each set uses the type shown
least so far among those it can supply. Small ゃゅょ decoys exist for only
9% of N5 words, so exact even rotation is impossible, and reports divide
misses by exposure (slice 0 spike, finding 4).
The decoy then does three jobs: it stops free last matches, it makes
players read carefully, and it measures which kinds of mistakes learners
make, at equal exposure.

- **Beat:**
  - random decoys from the same level, as in Juku's quiz (error types
    would only show up by chance, and couldn't be compared);
  - **classifying errors by hand:** it doesn't scale.

### D28: Reports as static files from a script, and a CSV (settled in substance: barebones)

The class report, the ability reports per learner and the measurement
report are written as static HTML or Markdown, plus a CSV of events.

- **Beat:** a live dashboard (needs the deferred backend); a CSV only
  (leaves the school to do the analysis, and they asked for insight, not
  data).

## Kanji readings (added 2026-11-21)

### D29: One reading on each word card, and every kanji's readings on the back (settled)

Arthur asked whether cards should show all of a kanji's readings. A
single kanji can have 8 or more (生: せい, しょう, い(きる), う(まれる),
なま…), which won't fit on a card and turns matching into guessing. The
cards are **words**, and a word has one reading in context (学校 is
always がっこう).

So the board stays one word with one reading. Flipping a card while
paused (L9) shows each of the word's kanji with its full reading list,
the reading used in this word highlighted, and 2–3 other words that use
the same kanji. The "same kanji, other reading" error type (R8) tests
this knowledge.

- **Beat:**
  - all readings on the card (doesn't fit, and isn't recall);
  - a kanji mode matching single kanji to their 2 most common readings
    at that level (a busy card, and "the key 2" is a judgement call).
- **Decided after the playtest:** a separate kanji mode that matches
  single kanji to their **meaning** (生 → life). Meanings are short, and
  readings stay in word mode, where they're unambiguous.

## Look and feel (added 2026-11-21)

### D30: A karuta table look, with a card-game layout (settled)

Arthur picked the karuta table: karuta is a traditional Japanese game of
matching what's read aloud to the right card, which fits the learning goal.
Cards look like washi paper with a vermilion hanko stamp for the difficulty
tag, on a dark lacquer or tatami table. On laptops, a side panel holds the
level, combo, timer and a score breakdown that counts up; on phones the
same blocks sit in a bar above the board. Built in slice 4.

The layout follows common card-game conventions, the genre Arthur named as
inspiration. The look is our own: no other game's card art, table texture,
score boxes, font or naming (D22).

- **Beat:** a night-market arcade (flashier, less tied to learning
  Japanese); clean stationery (easy to read, least like an arcade).
