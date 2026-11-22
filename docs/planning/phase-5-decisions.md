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

### D24: System fonts for Japanese (replaced by D31, 2026-11-22)

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
score boxes or naming (D22). The English font is the one exception (D31).

- **Beat:** a night-market arcade (flashier, less tied to learning
  Japanese); clean stationery (easy to read, least like an arcade).

### D31: Pixel fonts, English and Japanese (settled: Arthur's choice, 2026-11-22)

After the playtest Arthur picked two fonts: "balatro" by localthunk from
FontStruct for English, and DotGothic16 (via Fontsource) for Japanese.
Both are under the SIL Open Font License, which allows shipping them with
the game. The pixel font's licence and readme ship beside it in
`public/fonts/balatro/`, as the licence asks.

The English font comes from Balatro's developer, so it's the one place
the look borrows from that game, by Arthur's choice. The cards, colours,
table and Japanese theme stay our own (D22, D30). Neither font has a bold
weight, so faked bold is turned off to keep the pixels sharp.

- **Size:** the pixel font is 4 KB. DotGothic16's Japanese file is 396 KB,
  loaded once after the page draws and then cached. Fontsource's finely
  split version was beaten: it adds 80 KB (gzipped) to the stylesheet
  every page waits for.
- **Beat:** system fonts (D24: no download, but no game feel); Noto Sans
  JP (larger, and not a pixel face); m6x11 or other pixel fonts for
  English (Arthur asked for this one).

### D32: Pixel-art karuta cards (settled: Arthur's choice, 2026-11-22)

Arthur asked for the cards to look like an 8-bit card sprite sheet,
modelled on real karuta: a pixelated karuta card. Each card is a white
paper face in a thick karuta-green frame, with stepped pixel corners, a
lit top edge and a hard offset shadow, all drawn in CSS (no image files),
so it scales with the card. Reading cards are written top to bottom, as
karuta's grab cards are. The card's state shows in the frame's colour,
backed by the shake and the ✓ and ✗ marks (N4). The suit marks and hanko
tag from D30 stay; the washi texture and soft shadow go.

- **Beat:** image sprites drawn per card (sharper pixels, but an asset
  pipeline and fixed sizes); buying or reusing a pixel card pack (its
  playing-card faces don't fit karuta, and it would be someone else's
  art, D22).

### D33: A navy, aqua and crimson palette (settled: Arthur's choice, 2026-11-22)

Arthur found the pixel cards too plain and picked a blue and dark red
palette: navy `#1B3A57` (the table), crimson `#9B1B30`, pale aqua
`#A8DADC`, off-white `#F1FAEE` (the paper) and steel blue `#457B9D`. The
washi texture is back behind the card text. Word cards have a crimson
frame and reading cards a steel one, so the two rows read apart. Crimson
text gets a light glow where it sits on the navy table, as the two are
too close in brightness. Each card also shows the deck's JLPT level in
its bottom-left corner. This replaces D30's lacquer, vermilion, gold and
pine colours.

- **Beat:** keeping D30's colours (Arthur: boring with the pixel cards).

### D34: A drifting marbled table (settled: Arthur's choice, 2026-11-22)

Arthur asked for a background like a liquid marble pattern, in our
colours, blurred, and moving gently in a loop. The table is soft navy
bands on navy. The tile is drawn by SVG filters (smooth noise cut into
bands, coloured, then blurred) rather than as a picture, so it's a 2 KB
file. It's repeated 3 by 3 inside the SVG before blurring, so the tile
has no seam. A layer one tile larger than the window drifts by exactly
one tile every 80 seconds, so the loop has no jump. That's a transform,
which the graphics card moves without redrawing; a CSS blur every frame
would cost far more on school laptops. It stands still under reduced
motion.

- **Beat:** a looping GIF or video (megabytes, and blurry when scaled);
  tracing noise into vector shapes with d3-contour (crisp, but the blur
  makes crispness pointless, and it adds two dev dependencies); a
  canvas redrawn every frame (real flowing motion, but constant CPU).

### D35: A swirling shader table (settled: Arthur's choice, 2026-11-22)

D34's drifting tile only slid; Arthur wanted bands that bend and swirl,
like a looping psychedelic clip, and found the table and the reading
cards too alike. A WebGL fragment shader now draws the table: coordinates
are bent by a few sine waves, then cut into rings that also turn with the
angle, so they spiral. Every moving term turns a whole number of times per
24-second loop, so the loop has no jump. The shades are darker (deep navy
on navy), so both card frames stand out.

The canvas is a quarter of the window's size, stretched to fill it, and
redraws at most 30 times a second; the browser stops it while the tab is
hidden. Reduced motion shows a still frame, and without WebGL the plain
navy table shows. This replaces D34's SVG tile.

- **Beat:** D34's sliding tile (doesn't swirl); a looping video
  (megabytes, and fixed to one size); a library like three.js (far more
  than one full-screen shader needs; the WebGL setup is about 40 lines).

### D36: Pixel buttons and panels, with a click wipe (settled: Arthur's choice, 2026-11-22)

Arthur asked for the rest of the UI to be pixelated like the cards, and
for buttons to animate on click with colour sweeping in from left and
right and meeting in the middle. Panels and buttons share the cards'
stepped corners (three screen pixels), with a lit top edge and a shaded
bottom edge. Every button is one component, `PixelButton.vue`, in four
colours. On each click its wipe colour sweeps in from both edges in
small `steps()`, then fades, within 0.3 s (Arthur found 0.5 s with six
big steps looked like lag). When a click changes the button's colour (Pause
turns red, Resume turns back to blue), the wipe is the new colour and the
button keeps it once the halves meet. Under reduced
motion the wipe is skipped.

- **Beat:** NES.css (MIT, a ready-made pixel UI kit; it brings its own
  look and font, and we'd override most of it); styling each button
  separately (the same code eleven times).

**D33 update (2026-11-22):** Arthur asked for every card to be crimson,
reading cards too, with a crimson back. A wrong card's frame now turns
dark instead of crimson, so it still stands out, with its shake and ✗.

### D37: A kanji mode, as separate practice (settled: Arthur's choices, 2026-11-22)

Arthur asked for a second mode: one kanji shown, a hand of 8 reading
cards, and the player picks every reading that belongs to it, whether
that's one card or all eight.

- **Right answers:** the readings the kanji has in this level's words,
  not every reading in the dictionary (生 lists 20, many rare). A wrong
  card is a reading of another kanji that the dictionary doesn't list
  for this one, so it's never secretly right. Kanji are picked in
  proportion to their readings (up to 4), since most kanji have just one
  reading in a level.
- **Separate practice:** kanji mode has its own score and combo and logs
  no events, so the word reviews and the school's measurement stay as
  designed. Its play time still counts toward the nudges and the daily
  cap, through the same clock tick as word mode.
- **Picking the mode:** on a start screen each time the game opens, and
  from "Change mode".
- **Beat:** every dictionary reading (rare ones learners never meet);
  feeding kanji results into the reviews (new event types and report
  changes, and it would change what the school measures); a toggle in the
  side panel (Arthur preferred the start screen).

### D38: Matched cards snap away pixel by pixel (settled: Arthur's choice, 2026-11-22)

Arthur didn't want matched cards to fall and fade, nor to wipe away in
rows: they should vanish pixel by pixel in a circle, from the top-left
corner to the bottom-right, like the snap in a well-known film, with no
ash left behind. Each card is cut into 30 by 40 square blocks (first 12 by
16; Arthur found those too big). A block's turn is its distance from the
top-left corner, with across counting more than down so the left side
always clears before the right, plus a little randomness for a ragged
edge. The snap plays 25 clip paths in 0.65 s (Web Animations), each
cutting away a few more blocks, starting when the throw hits. It first
used mask images, but the browser loads each one as it's swapped in and
shows the card unmasked until then, which flashed; a clip path applies at
once. Under
reduced motion a matched card vanishes at once. Blocks are timed by their rank along the front rather than their
distance, so every step takes the same number: a curved front crosses
few blocks near the corners, and timing by distance crawled at the end
and looked stuck. A snapped card is hidden outright when the snap ends or
is interrupted, so none is ever left part-way.

- **Beat:** the top-down row wipe (Arthur: not this); particles flying
  off (that's the ash he didn't want, and costs more to draw).

### D39: The combo as a style rank (settled: Arthur's choice, 2026-11-22)

Arthur asked for combo tiers like an action game's style meter. The
combo shows as a letter grade from F to SSS, as Arthur asked: F from 2,
E from 4, D from 6, C from 9, B from 12, A from 15, S from 20, SS from 25
and SSS from 30. Each has a word of praise in easy Japanese (がんばれ, よし,
いいね, うまい, すごい, さいこう, かんぺき, てんさい, でんせつ), so even the
cheering is reading practice, and a bar fills toward the next rank. A
rank-up slams the letter in with a sound pitched above the level-up's. The
meter floats gently while it waits, like the cards. Letter grades are a
common way to score style; the words and thresholds are our own.

- **Beat:** another game's rank names (D22); a gauge that drains when idle
  (it would change the game's rules, not just how the combo looks).

**D32 update (2026-11-22):** Arthur found the card backs and faces didn't
look pixelated. Both textures are now tiny SVG tiles of hard-edged pixels
on the card's own pixel grid: specks on the washi faces (and on paper
panels and buttons), and a diamond lattice on the crimson backs.

