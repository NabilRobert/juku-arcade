# Phase 5: Decisions

Each decision lists the options it beat. **Settled** means it was chosen
on 2026-11-21 or later, as dated. **Recommended** means it isn't
settled yet. Requirement numbers (L1, R2…) point to phase 2.

## Reuse first

| Need | Reused | Built here |
|---|---|---|
| Word data | **OpenJLPT** at commit `bf4e1ee`, as in Juku (ADR-003) | A build script that writes per-level decks (D15) |
| Review scheduling | **Juku's Leitner engine** (`NabilRobert/juku-agents-ai`), ported to TypeScript | The port, about 40 lines, credited in its commit (D13) |
| Option picking for the check-up | Juku's quiz option rule (same level, similar reading) | The TypeScript version |
| Attribution wording | Juku's data attribution page | — |
| UI, state, tests | Vue 3, Pinia, Vitest (the usual stack) | — |
| Animation | Motion for Vue (MIT) | — |
| Browser storage | Dexie (Apache-2.0) | — |
| Sound | CC0 sound packs (for example Kenney's) | — |
| The loop, scoring, difficulty model, check-up design | — | **Built:** this is what the project demonstrates |

Juku is Python, so the browser game can't depend on it
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
- The twist makes level 5 a high-stakes spot. S4 watches whether the
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

### D5: Set score with stacking card tags (settled; replaced by D46, 2026-11-23)

**Replaced (2026-11-23):** the set score is gone; banked coins are the
only score (D46). The text below is kept as the record.

`chips × multiplier`. Chips are 10 per clean match plus 1 per second
left. The multiplier is `level × (1 + the sum of the clean matches'
tags)`. The tags stack by adding up within a set (multipliers
can stack), and the level multiplies the total. The worked example is in
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
  and new words have no data); fixed tags (drops the learning the game
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
- **Settled:** hide the card faces while paused (L9).
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

Grammar is more complicated than matching cards, so it comes
after the playtest. The **leading candidate** to revisit then is **gap
sentences** on the same board: 5 short sentences with a gap, and the
particle or verb form for each gap. Each set is built so that every answer
fits exactly one sentence. OpenJLPT has 526 grammar points with Tatoeba
examples to draw from.

- **Also considered:** a pattern matched to its meaning (easy content,
  but it only tests recognition; maybe an easy mode); matching sentence
  halves (often several endings fit).

## Build

### D12: Vue 3, TypeScript, Vite, Tailwind, Motion for Vue, Pinia, Vitest (settled, 2026-11-21)

The cards are ordinary page elements, so the Japanese text stays sharp
and the cards are easy to test. Motion sequences the deal, flip, fly-off
and combo effects.

- **Beat:** PixiJS or Phaser on a canvas (overkill for 11 cards, harder
  Japanese text and tests, and outside the stack); CSS transitions only
  (sequenced effects get fiddly by hand).
- **Rule split:** the game rules (L2–L8) live in plain TypeScript in
  `src/game/`, with no Vue. They're unit-tested on their own, and Vue only
  draws them.

### D13: Port Juku's Leitner engine behind a Juku-shaped interface (settled, 2026-11-21)

- **Beat:**
  - **ts-fsrs** (MIT): a better scheduler, but it differs from Juku, so
    moving to Juku's API later would change how the game behaves;
  - **depending on Juku:** it's Python, so it can't run in a
    browser;
  - **a new scheduler:** no reason to write one.

### D14: Event log in IndexedDB through Dexie (settled, 2026-11-21)

- **Beat:**
  - **localStorage:** a 5 MB cap and blocking calls, which suits a log of
    events badly;
  - **idb:** smaller and lower-level. A fair alternative if bundle size
    gets tight.

### D15: Decks generated from pinned OpenJLPT at build time (settled, 2026-11-21)

A TypeScript script reads OpenJLPT's SQLite file with Node's built-in
`node:sqlite` (Node 22.13+), checks the checksum, applies L2's rules, and
writes the deck files. The script also counts how many words per level
pass L2, which is slice 0's spike.

- **Beat:**
  - committing the generated JSON (generated bulk, against the repo
    rules);
  - reusing Juku's Python reader (an extra language for the build);
  - waiting for a school's own word lists (blocks all content);
  - **better-sqlite3:** the fallback if `node:sqlite` falls short.

### D16: Measure within each player, with a random held-back control (settled in substance)

The built-in check-up was chosen, with no class study. The held-back
control is how the check-up can answer the headline on its own (phase 3).

- **Beat:** a class that doesn't play (the school's job; optional); game
  stats only (speed and memory mixed, and no control); the school's own
  tests (timing, and they may not cover our words).

### D17: Check-up of 5 questions, 4 options, 8 seconds, optional and daily (settled)

- **Beat:** typing kana (true recall, but slow and error-prone on
  phones); 20 questions weekly (easier to skip, and fewer data points).

### D18: Admin is barebones: an export and a script (settled)

Admin tools aren't planned yet, and the data path stays barebones. So:
an anonymous JSON export plus a summary script (A1, A2). A tiny backend
(Cloudflare Worker with D1) may come after the playtest. It isn't planned
here.

- **Beat:** using Juku's server (Juku is paused, so this would block on
  it); a backend now (not needed to learn whether the loop works).

### D19: Wellbeing: a 15-minute nudge, a cap if minors play, and a never-list (settled)

The cap is a deploy setting, not an admin screen (barebones).

- **Beat:** a nudge only (not enough for children); a hard cap for
  everyone (patronising for adults).

### D20: Static hosting on Cloudflare Pages' free tier (settled, 2026-11-21)

The same platform as Framed, with a preview build per branch, and room
for a Worker later.

- **Beat:** GitHub Pages (fine, but no custom headers and no preview per
  branch); a self-managed server (a static game needs no server to
  maintain).

**D20 update (2026-11-23):** the public build now deploys to GitHub Pages,
at <https://nabilrobert.github.io/juku-arcade/>, so anyone can try it.
`.github/workflows/deploy.yml` runs the CI checks, builds with
`--base=/juku-arcade/` (Pages serves the game from that folder) and
deploys on every push to `main`. What that gives up, as above: Pages
ignores `public/_headers`, so there's no content security policy or cache
rule, and there's no preview per branch. It also shares browser storage
with any other site under `nabilrobert.github.io`. Cloudflare Pages stays
the choice for a class playtest (docs/playtest.md).

**D20 update (2026-11-27):** the demo has left GitHub Pages for the
owner's server, behind a password (D76).

### D21: Licences (open: the code licence)

The data is CC BY-SA 4.0, as OpenJLPT requires, with attribution. The
code licence isn't chosen yet; MIT is suggested.

### D22: Original, with genre inspiration only (settled)

"Card hands with score combos" is a genre. juku-arcade has its own name,
card design and scoring formula (D5). It has no jokers, shop, poker hands
or card art from any existing game. Every visual is checked against this
before it ships.

### D23: Sound is a Could (settled, 2026-11-21)

CC0 sounds only, muted until the first tap. Sound is first on the cut
list.

### D24: System fonts for Japanese (replaced by D31, 2026-11-22)

- **Beat:** a Noto Sans JP webfont (OFL licence, but megabytes before
  subsetting, which works against N1).

## Data for decisions (added 2026-11-21, after review)

### D25: The score motivates, and the data measures (settled)

Per-player tags make scores meaningless as a measure
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

### D27: Decoys that test error types (settled, 2026-11-21)

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
  (leaves the school to do the analysis, when it needs insight, not
  data).

## Kanji readings (added 2026-11-21)

### D29: One reading on each word card, and every kanji's readings on the back (settled)

Should cards show all of a kanji's readings? A
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

The karuta table won: karuta is a traditional Japanese game of
matching what's read aloud to the right card, which fits the learning goal.
Cards look like washi paper with a vermilion hanko stamp for the difficulty
tag, on a dark lacquer or tatami table. On laptops, a side panel holds the
level, combo, timer and a score breakdown that counts up; on phones the
same blocks sit in a bar above the board. Built in slice 4.

The layout follows common card-game conventions, the genre that inspired
it. The look is our own: no other game's card art, table texture,
score boxes or naming (D22). The English font is the one exception (D31).

- **Beat:** a night-market arcade (flashier, less tied to learning
  Japanese); clean stationery (easy to read, least like an arcade).

### D31: Pixel fonts, English and Japanese (settled, 2026-11-22)

After the playtest, two fonts were picked: "balatro" by localthunk from
FontStruct for English, and DotGothic16 (via Fontsource) for Japanese.
Both are under the SIL Open Font License, which allows shipping them with
the game. The pixel font's licence and readme ship beside it in
`public/fonts/balatro/`, as the licence asks.

The English font comes from Balatro's developer, so it's the one place
the look borrows from that game, by choice. The cards, colours,
table and Japanese theme stay our own (D22, D30). Neither font has a bold
weight, so faked bold is turned off to keep the pixels sharp.

- **Size:** the pixel font is 4 KB. DotGothic16's Japanese file is 396 KB,
  loaded once after the page draws and then cached. Fontsource's finely
  split version was beaten: it adds 80 KB (gzipped) to the stylesheet
  every page waits for.
- **Beat:** system fonts (D24: no download, but no game feel); Noto Sans
  JP (larger, and not a pixel face); m6x11 or other pixel fonts for
  English (the one asked for).

### D32: Pixel-art karuta cards (settled, 2026-11-22)

The cards should look like an 8-bit card sprite sheet,
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

### D33: A navy, aqua and crimson palette (settled, 2026-11-22)

The pixel cards looked too plain, so the table got a blue and dark red
palette: navy `#1B3A57` (the table), crimson `#9B1B30`, pale aqua
`#A8DADC`, off-white `#F1FAEE` (the paper) and steel blue `#457B9D`. The
washi texture is back behind the card text. Word cards have a crimson
frame and reading cards a steel one, so the two rows read apart. Crimson
text gets a light glow where it sits on the navy table, as the two are
too close in brightness. Each card also shows the deck's JLPT level in
its bottom-left corner. This replaces D30's lacquer, vermilion, gold and
pine colours.

- **Beat:** keeping D30's colours (boring with the pixel cards).

### D34: A drifting marbled table (settled, 2026-11-22)

The brief was a background like a liquid marble pattern, in our
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

### D35: A swirling shader table (settled, 2026-11-22)

D34's drifting tile only slid; the brief was bands that bend and swirl,
like a looping psychedelic clip, and the table and the reading cards
looked too alike. A WebGL fragment shader now draws the table: coordinates
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

### D36: Pixel buttons and panels, with a click wipe (settled, 2026-11-22)

The rest of the UI should be pixelated like the cards, and
buttons should animate on click with colour sweeping in from left and
right and meeting in the middle. Panels and buttons share the cards'
stepped corners (three screen pixels), with a lit top edge and a shaded
bottom edge. Every button is one component, `PixelButton.vue`, in four
colours. On each click its wipe colour sweeps in from both edges in
small `steps()`, then fades, within 0.3 s (0.5 s with six
big steps looked like lag). When a click changes the button's colour (Pause
turns red, Resume turns back to blue), the wipe is the new colour and the
button keeps it once the halves meet. Under reduced
motion the wipe is skipped.

- **Beat:** NES.css (MIT, a ready-made pixel UI kit; it brings its own
  look and font, and we'd override most of it); styling each button
  separately (the same code eleven times).

**D33 update (2026-11-22):** every card is now crimson,
reading cards too, with a crimson back. A wrong card's frame now turns
dark instead of crimson, so it still stands out, with its shake and ✗.

### D37: A kanji mode, as separate practice (settled, 2026-11-22)

A second mode: one kanji shown, a hand of 8 reading
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
  side panel (the start screen won).

### D38: Matched cards snap away pixel by pixel (settled, 2026-11-22)

Matched cards shouldn't fall and fade, nor wipe away in
rows: they should vanish pixel by pixel in a circle, from the top-left
corner to the bottom-right, like the snap in a well-known film, with no
ash left behind. Each card is cut into 30 by 40 square blocks (first 12 by
16 looked too big). A block's turn is its distance from the
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

- **Beat:** the top-down row wipe (rejected); particles flying
  off (the ash that wasn't wanted, and costs more to draw).

### D39: The combo as a style rank (settled, 2026-11-22)

The combo has tiers, like an action game's style meter. The
combo shows as a letter grade from F to SSS: F from 2,
E from 4, D from 6, C from 9, B from 12, A from 15, S from 20, SS from 25
and SSS from 30. Each has a word of praise in easy Japanese (がんばれ, よし,
いいね, うまい, すごい, さいこう, かんぺき, てんさい, でんせつ), so even the
cheering is reading practice, and a bar fills toward the next rank. A
rank-up slams the letter in with a sound pitched above the level-up's. The letter, the word and
the combo count warm rank by rank, from off-white through aqua and pinks
to a bright red at SSS (brighter than the palette's crimson, which is too
dark to read on the navy table). The
meter floats gently while it waits, like the cards. Letter grades are a
common way to score style; the words and thresholds are our own.

- **Beat:** another game's rank names (D22); a gauge that drains when idle
  (it would change the game's rules, not just how the combo looks).

**D32 update (2026-11-22):** the card backs and faces didn't
look pixelated. Both textures are now tiny SVG tiles of hard-edged pixels
on the card's own pixel grid: specks on the washi faces (and on paper
panels and buttons), and a diamond lattice on the crimson backs.

### D40: A pixel seal logo, and 塾 on every card back (settled, 2026-11-22)

The card backs should carry 塾 (juku, a cram school,
the game's name) rather than 札 (fuda, "card"), and the logo should be like
a hanko seal in our pixel style. The logo is red 塾 inside a red ring on
a white disc, with the circle worked out on a 24-pixel grid so its edge
steps like pixel art (`pixel-seal.ts`, drawn by `PixelSeal.vue`). It sits
beside the title, on every card back (both kinds) and on the deck.

### D41: Kuronuri for Japanese (settled, 2026-11-22)

The Japanese font is Kuronuri (黒塗り, by lihbr, SIL OFL 1.1).
It's drawn in Redaction's photocopied style and comes in seven
pixel levels. 70 was chosen first, clearly pixelated. Playtest
feedback (2026-11-24) found it hard to read, and its thin serif strokes
break up worst in small furigana, so the game now uses 35: still
pixelated at the edges, but each stroke stays whole. It covers JIS levels 1 to 4, so it replaces
DotGothic16 (D31) and that package is removed.

The npm package (@lihbr/kuronuri) splits the font into character slices,
so a browser downloads only the slices a page shows. Its stylesheet also
carries italic and bold, three times the size (89 KB against 29 KB
gzipped), so `npm run fonts` keeps only the regular rules, generated like
the decks and never committed, and `main.ts` loads them after the page
draws.

- **Watch:** the package is new (0.0.3, one author). If it breaks, switch
  the font stacks in `style.css` back to DotGothic16.
- **Beat:** DotGothic16 (D31; Kuronuri's look won); level 70 (hard to
  read, see above); Fusion Pixel and Stick (compared side by side,
  2026-11-24); level 100
  (complex kanji like 塾 blur at card size); the package's full stylesheet
  (89 KB gzipped for weights the game never uses).

### D42: Crests in kanji mode, and crest colours on the cards (settled, 2026-11-22)

The bank run's crests (koban, omikuji, curse) come to kanji
mode too. Kanji mode has no pause and no coins, so the crests pay in
points and come with their own Scout button:

- Each round may hide one good crest on a right reading and one curse
  on a wrong reading (`kanji/kanji-crests.ts`). The good crests only sit
  on right answers so they reward knowing the reading, and the curse is
  always a decoy, so it punishes a guess.
- A koban doubles that card's points, an omikuji adds 5 to 15, and a
  curse takes 10. The score never drops below 0.
- Scout flips the hand over and uses one of the run's scouts (2 to start,
  1 more per perfect round, up to 3). Turning the hand back is free.
  Play waits until the hand is turned back.

Crests then got to colour the cards, not just a small tile:
a scouted card's whole back (frame and lattice) and its front frame take
the crest's colour (`tint` in `crests.ts`, drawn by `CardFrame.vue`),
in both modes. The crest's symbol sits on the back in the same round
pixel seal as 塾 (a light disc in a ring), in the crest's colour, so
every back reads as one family. The marks stay until the set or round ends, so the player
remembers which face-up card was gold. They appear only after a scout;
an always-coloured front would make scouting pointless. A status colour
(picked, wrong, right) still wins on the front.

- **Beat:** reusing the pause (kanji mode has none); coins in kanji mode
  (it has no wallet or shop); colouring fronts without a scout (gives
  the crests away).

### D43: Pixel-art icons for Scout, sound and coins (settled, 2026-11-22)

Two stock pictures set the style of the icons: a pixel magnifying
glass for Scout, and a pixel speaker for the sound switch (only "on" and
"off"). Both are stock art with licence terms (one watermarked and paid),
so the game doesn't use the files. It draws its own icons in the same
style: a grey glass with an aqua lens and a white glint, and an orange and
yellow speaker with sound waves or a cross, outlined in near-black.

A pixel coin (a Freepik asset) set the style for the pot and prices; the
game draws its own in that style too: an octagonal gold coin with a lit
rim, an orange inner ring and a $.

Each icon is a grid of letters, one per pixel, in `pixel-icons.ts`, drawn
as one SVG path per colour by `PixelIcon.vue`. The grid reads like the
sprite, so changing a pixel is a one-letter edit, and a letter missing
from the palette throws rather than leaving a hole.

- **Beat:** downloading the stock images (licence); emoji (they don't
  match the pixel style, and look different on every system); an icon
  font (a dependency for three icons).

### D44: Word mode plays as a bank run (settled, 2026-11-22; rounds replaced by D46)

**Updated (2026-11-23):** the rounds, targets and game over below are
gone; the run is endless and its coins are the score (D46).

The idea: the
combo is money. Every match adds coins to a pot, more the longer the
combo; banking keeps the coins but ends the combo, and a miss loses the
pot. Coins buy items between rounds, and a round of 3 sets must bank a
target that grows, or the run ends. It was built as a spike
(`spike/roguelike-bank`), playtested locally and merged (PR #10),
so it now ships as word mode's run (`src/bank-run/`). Crests and scouting
(D42) grew out of it.

- **Why it fits:** the risk sits on the thing the game teaches. Riding a
  combo means knowing more readings in a row, so the push-your-luck
  choice rewards learning, not luck.
- **Kept separate:** the bank run's coins never touch the review engine
  or the logs; the words played still count as reviews as before.
- **Beat:** a charm run with rounds, targets and upgrades (a second spike,
  `spike/roguelike-charms`, kept as a local branch); no run at all (less
  reason to keep a combo going).

### D45: Three wrong picks per kanji (settled, 2026-11-23)

From the playtest: one play ended a kanji round, so a single wrong guess
gave no chance to try again. Now each play throws the picks; right ones
are found, wrong ones stay marked and out of play, and the player picks
and plays again until every right reading is found or three picks were
wrong (`MAX_WRONG_PICKS` in `kanji/kanji-round.ts`). The round is scored
on all the picks, as before. Three squares by the Play button count the
wrong picks left.

- **Beat:** three plays per kanji, however many picks were wrong (lets a
  player pick everything at once); one play per kanji (too harsh).

### D46: An endless bank run, with flat coins as the only score (settled, 2026-11-23)

From the playtest and a reviewer's pushback:

- **Rounds cut runs short.** A run of 3-set rounds ended players' runs
  before they could build a big combo, even when they matched every card.
- **The multiplier ran away.** The set score's multiplier (level × card
  tags) and the bank run's coins (as many as the combo) could reach
  millions in a long run.
- **The shop had no point.** Its items only made more coins, and coins
  only bought items.

So:

- **Endless:** no rounds, targets or game over; the run goes on until the
  player leaves.
- **Flat coins:** every match pays 10 coins (`COINS_PER_MATCH`) whatever
  the combo. Banked coins are the only score: the set score, its box
  and best set, and the "+0.1×" badges are gone. Each word's tag is still
  worked out and logged for the reports.
- **A shop you choose to open:** after a set, the shop may turn up for
  the next one (a 1 in 3 chance, never two sets running). Its button shows
  in the side panel; opening it pauses the game. Buying spends coins, so
  an item lowers the score now for faster coins later, an investment.
- **Tuning:** item prices (80 to 180), the curse (30) and omikuji gifts
  (50 to the pot, 30 banked) are first guesses for flat coins, to be
  tuned in play. The crane saves one pot and flies off, and scouts refill
  when the shop comes.

- **Beat:** capping the multiplier (still two scores); combo-scaled coins
  with a cap (asked about, flat chosen); items that help play directly,
  such as more time (kept for a later mode); removing the shop.

### D47: A leaderboard with sample players (settled, 2026-11-23)

The start screen shows a top-five leaderboard on its left, ranked by
score (banked coins). Until there's a server to share scores, the other
players are ten made-up names, labelled as samples, and your best from
this browser is ranked among them (`leaderboard/leaderboard.ts`). Real
scores come with per-student profiles, which are planned: the school's
database would be read-only for us, so profiles and scores need a store
of our own.

- **Beat:** a panel inside the game screen (crowds the side panel); no
  board until real data exists (nothing to see in a demo).

**D47 update (2026-11-23):** the board fills the left of the start screen
and looks like an arcade high-score table: a steel-blue pixel box with
LEADERBOARD in yellow inside it, numbered rows with each player's coins,
and BACK and NEXT to page through 23 sample players and you, 8 to a page
(`ROWS_PER_PAGE`).

### D48: Drag throws at once; clicking lays out a hand (settled, 2026-11-23)

From the playtest: a player kept dragging readings onto their words.
That already queued them for Play, but the card sprang back into the
hand with only a small tag, so it looked like nothing happened. Now a
card dragged or flung onto a word card is thrown at once, with no Play,
and clicking still lays a hand out in order for Play. A word card with a
reading laid for it shows the same number tag, and its label shows the
reading. A press that moves under 10 px (`TAP_SLOP_PX`) counts as a
click: Motion started a drag on the smallest wobble, which swallowed
some clicks.

- **Beat:** dragging queues too (what the playtest found confusing);
  removing the click path (slower, and harder on a trackpad).

### D49: Buttons play an 8-bit select blip (settled, 2026-11-23)

Every pixel button plays a sound when pressed. The first try, clicks from
Kenney's UI Audio pack (CC0), sounded too unnatural for the game, and
the wish was something like the menu sounds of handheld monster-catching
games. Those belong to their makers, so the game makes its own in that
style with ZzFX: four short square- and triangle-wave candidates were
tried by ear. A soft pip (a rounded 988 Hz note) was chosen first, then,
after trying both in the game, the two-note "select" blip (`click` in
`sound/sfx.ts`: a square wave at 880 Hz jumping to 1320 Hz after 30 ms,
50 ms in all). Being made in code, it needs no audio file.

- **Beat:** the Kenney clicks (too plain); the soft pip and a harder
  square pip (the other candidates); copying a commercial game's sounds
  (not ours to ship).

### D50: Looping background music with a volume slider (settled, 2026-11-23)

The game plays "France Instrumental" by Sub_Clair on a loop (from
2026-11-24; it replaced "You're Not There" by MagiaZ), from Pixabay under
the Pixabay Content License: free to use in a
game, no credit needed (it's credited in the README anyway). The licence
bars passing the file on by itself, unchanged; shipping it inside the
game is its normal use.

- **Lighter file:** the 4.2 MB, 256 kbps MP3 is re-encoded to 96 kbps AAC
  (`public/music/france-instrumental.m4a`, 1.6 MB, the full 2:11) with
  macOS's own `afconvert`, so the first load stays reasonable. Every
  major browser plays AAC.
- **Playback:** one looping `<audio>` element (`sound/music.ts`). It
  starts on the first press anywhere, as browsers block sound before
  that, and pauses while the tab is hidden.
- **Volume:** a Music slider and an Effects slider (0 to 100%, 0 is off),
  in both side panels and in Settings, each remembered in this browser
  (`sound/volume.ts`). Music starts at 30%, under the card sounds; effects
  start at full. The sound switch silences the music too, so one press
  quiets everything.
- **Effects over the music:** under the music the effects were hard to
  hear (measured: the track averages about 0.045 at 30%, while a chime
  peaked at 0.16 and a button sound at 0.07). So the effects play louder:
  ZzFX's master volume is 0.6 instead of its default 0.3, and the card
  recordings play at 0.9 instead of 0.5 (`SYNTH_VOLUME`,
  `RECORDING_VOLUME` in `sound/sfx.ts`). The music keeps its volume.

- **Beat:** Web Audio buffer looping (gapless, but decodes the whole
  track into memory); shipping the original MP3 (2.6 times the
  size); a separate music on/off button (the slider's 0 does that).

### D51: Cards brush with a soft sound on hover (settled, 2026-11-23)

Moving the mouse onto a card plays a short slice (0.12 s) of the card
shuffle recording at about a third of its usual volume: the same paper
sound as picking a card up, as a brush. Each card along the board plays
half a semitone higher than the one before, so a sweep along the hand
plays a little run. At most one tick plays every 60 ms
(`HOVER_GAP_MS`), as a sweep crosses several overlapping cards at once.
There's none on touch screens, while a mouse button is held (a drag),
or on face-down or matched cards. It follows the Effects slider and the
sound switch.

- **Beat:** an 8-bit tick like the buttons (asked for a card sound
  instead); a sound on every pointer move (a buzz); a per-card sound
  file (none needed).

### D52: Deal one card at a time, each with its own sound (settled, 2026-11-23)

The cards were dealt 0.07 s apart, so a whole set landed in under a
second and looked like one drop. Now they leave the deck one at a time,
150 ms apart (`DEAL_STAGGER_MS` in `cards/card-motion.ts`), left to right
with the top row first, and each plays a short flick (0.15 s) of the card
shuffle recording as it goes, instead of one riffle for the whole deal.
A word-mode set takes about 1.6 s to deal and a kanji round about 1.3 s.

- **Watch:** the set timer runs during the deal, so at level 5 (12 s a
  set) the deal uses a bigger share of the time. If that feels unfair,
  the timer can start once the last card lands.
- **Beat:** one riffle for the whole deal (didn't match each card
  landing); a slower step (too long between sets).

**Fix (2026-11-23):** the shuffle recording's first 0.17 s is the card
barely moving (peaks under 0.03), so the short deal and hover slices
(D51) were nearly silent. Both now start at the flick, 0.17 s in
(`RECORDING_STARTS_S` in `sound/sfx.ts`); the deal plays at 0.6 of the
usual recording volume.

**Update (2026-11-23):** picked by ear from the hover test page, each
dealt card now plays a soft, high tap instead of the flick: 0.07 s of
the card landing recording (`card-place-1.ogg`, from its hit at 0.12 s),
at 1.4 times its speed and 0.3 of the volume. The taps rise half a
semitone per card along each row, starting again for the reading row
(`rowPlace` on `PlayCard.vue`), so the second row doesn't end too high.

### D53: Inspecting a card makes a card sound, and keeps the board (settled, 2026-11-23)

While paused, turning a word card over to read its back (and back again)
now plays the card's flick, like picking a card up, and a face-down word
card ticks on hover (D51), as it can be turned over. The pick-up sound
now starts just before the flick (0.15 s into the recording) instead of
at the recording's quiet start, so it no longer sounds late.

A bug from the playtest: after reading a card's back, cards already
matched came back. The back replaced the board, so closing it rebuilt
the board: every card was dealt again, and a card already matched never
saw the change that starts its snap, so it stayed. The board is now only
hidden while a back shows (`v-show`), and a card drawn already matched
starts hidden (`usePixelSnap`), in case the board is ever rebuilt.

- **Beat:** showing the back as an overlay on the board (more layout
  work for the same result).

### D54: A private table picture for a local copy (settled, 2026-11-23)

A local copy can show a picture as the table instead of the swirl. The
picture chosen for it is someone else's pixel art, so it must never be
committed or deployed: it lives in `public/local/`, which git ignores,
and `.env.local` (also ignored) names it in `VITE_TABLE_IMAGE`. The code
is a small, general option in `TableBackground.vue`: with the setting,
it shows the picture (a still image or an animated GIF, which plays on
its own) pixel-sharp, darkened by a 40% navy wash so the
cards stand out, and skips the swirl's shader; without it, as in every
public build (neither file is committed, and the demo bundle leaves
`public/local/` out), nothing changes.

- **Beat:** committing the picture (not ours to publish); keeping the
  change as uncommitted edits (in the way of every later commit).


### D55: Grammar content G0: generated tales from typed templates (spike, 2026-11-24)

The first slice of the grammar mode (its design agreed on 2026-11-24)
is a content spike with no screen: can templates and a matcher make
Japanese good enough to build on? `npm run grammar:preview` prints 50
tales for a native speaker to read.

- **Content:** 5 grammar points × 3 templates (`src/grammar/templates.ts`)
  and 47 N5 nouns tagged person, place, food, thing or time, plus the 9
  verbs the templates use (`lexicon.ts`). The design suggested は, を,
  に (time), で (place) and まで. まで was swapped for も, because the shelf
  map allows none of the other four on the twist shelf, and every tale
  needs a twist.
- **Templates are TypeScript data,** checked by the type checker, with
  slots written `<who>` and verbs `<食べる:mashita>`. The build check
  (`npm run grammar:check`) joins them with the shelf map (at least 3
  templates on at least 2 shelves per point, only on allowed shelves),
  checks the agreed tile shape (at least 2 noun+particle units, 3–5
  tiles, no two alike), and checks every word against the pinned
  OpenJLPT build.
- **The order checker** works from each template's units, as agreed:
  units may swap, except that the predicate stays last and fixed units
  keep their place, and a template can list particle swaps that are also
  right.
- **Conjugation is plain code** (`conjugate.ts`, about 30 lines): N5
  needs only 4 polite forms, from OpenJLPT's verb classes.
- **Beat:** jv-conjugator (ISC, one maintainer, last release December
  2024) and kamiya-codec (Unlicense, one maintainer, May 2025). Both are
  allowed and maintained, but each covers far more forms than N5 needs,
  so a dependency would be heavier than the problem. Revisit at N4, when
  て, た, ない and potential forms arrive.
- **Beat:** a YAML or JSON template file with a loader, which would mean
  more code and lose the type check.
- **Two agreed rules didn't fit G0, and are reported rather than bent.**
  "Drop a repeated subject": with at least 2 loose noun+particle pairs
  in 3–5 tiles, a sentence has no room for a third, glued-on subject, so
  dropping a loose subject pair would leave one pair. Names repeat for
  now. "One politeness level per tale": every template is
  polite, so this holds without any code.
- **Tale lengths:** one point per line and 5 points cap tales at 5 lines;
  6-line tales need a sixth point (G1). も's follow-on template never
  appears yet, because も is the only twist point and is always used on
  the twist line.

### D56: Bunpou, the grammar mode's playable loop (G1, 2026-11-24)

The grammar mode, named Bunpou for now, is the start screen's third mode.
A run offers each line of a generated tale (D55) as shuffled tiles; the
player puts them in the strip's boxes, the line is judged when the last
box is filled or its time runs out, and the tale is revealed after its last line.

- **Rules as pure functions** (`src/grammar/bunpou-run.ts`), like word
  mode's (D12), with a thin composable (`useBunpouRun.ts`) for the clock,
  sounds and keys.
- **Word mode's rules, unchanged:** a miss or timeout resets the combo to
  0, with no speed bonus and no idle decay; levels come from `levels.ts`.
  The time is per tile: 8, 6, 4.4, 3.4 and 2.4 seconds at levels 1 to 5.
  A right line scores 100 times the combo rank's multiplier (F ×1, E
  ×1.25, D ×1.5, C ×2, B ×2.5, A ×3, S ×4, SS ×5, SSS ×6; ×1 below F).
- **The screen is built from the existing UI**, as asked: tiles use the
  pixel-button style on washi paper, with `PixelButton`, `StatPanel`,
  `ComboMeter`, `WellbeingGate` and `SoundToggle` as they are. Furigana
  sits under the kanji by styling around `FuriganaText`, which is
  unchanged.
- **Input:** tap to put a tile in the first empty box, drag it onto any
  box (even past empty ones, added 2026-11-24 after playtesting), drag a
  placed tile to another box to move it (swapping with a tile there) or
  off the strip to take it back, tap a placed tile or press Backspace to
  take it back, keys 1–5 to place. A timed-out line's empty boxes stay
  empty in its fix and are never marked wrong. Dragging uses Motion for Vue, which already throws the cards, and
  the cards' tap-or-drag check (`isDrag`). Beat: a sortable-list library
  (SortableJS or vue-draggable-plus, both MIT), a second drag system for
  one strip; plain pointer events, which would rebuild what Motion does.
- **A miss shows its fix** for 3 seconds: the player's tiles with the
  wrong ones marked against the closest right order (`closestFix`), the
  right sentence, and the point's pattern in Japanese only
  (`POINT_PATTERNS`). A timeout with nothing placed shows えーと….
- **Pause** freezes the line's clock, turns the tiles face down where
  they lie (the card back, as word mode does, so the table doesn't move),
  and floats the run's last 8 misses with their fixes below it, over
  the page rather than in the layout, with the hint over the combo meter.
- **Grammar hint** (added 2026-11-24, after playtesting): the line's
  pattern (人＋と) shows beside 起承転結, as building blind was too hard.
  It's free and on by default; a switch in the side panel and in
  Settings turns it off, remembered in this browser (`preferences/hints.ts`).
  - **Beat:** a paid hint like word mode's Scout (the point is learning
    the pattern, not saving coins); showing the first tile (gives away
    the order, which is the exercise).
- **Furigana switch** (added 2026-11-24): Settings can turn furigana off
  everywhere it shows (Bunpou, and word cards' example sentences), for
  players who want to read without it. On by default; Kanji mode never
  shows furigana. It and the hint, like the mute switch, are small on/off
  choices kept in this browser by one helper (`preferences/stored-flag.ts`),
  not in the saved settings.
- **Content:** 5 more points (まで, と, から, が, がある・がいる), 3
  templates each, for 30 templates on 10 points. With three points on the
  twist shelf, tales now reach 6 lines.
- **Not yet:** reviews and logging (G2, now D57); the stage (G3); the
  haiku and the leaderboard (G4). The side panel and buttons use English
  labels like the other modes; the sentences, fixes and patterns have no
  English.

### D57: Grammar reviews and the grammar log (G2, 2026-11-24)

Each grammar point has its own spaced reviews, and every judged Bunpou
line is logged.

- **A separate grammar log:** a second table in the browser database
  (`grammarEvents`, database version 2), never the word log. Word memory
  reads any answer in the word log as a word answer, so grammar answers
  there would corrupt it. One event per judged line: the point, the
  template, the outcome (right, wrong or timeout), the rule a wrong order
  broke, the answer, the time taken, the level, the combo before and the
  review box before (`grammar/grammar-events.ts`). "Delete my data"
  clears it too; the upgrade keeps the word log and settings.
- **The broken rule** is the most basic one the answer broke: the verb
  not last, then a particle after the wrong word, then pieces in the
  wrong order (`grammar/broken-rule.ts`).
- **The schedule is the words' own:** each point's record is updated by
  the same function as a word's (`word-memory.ts: recordAnswer`, over
  `leitner.ts: afterAnswer`, unchanged). A right sentence is a right
  answer, a wrong order a wrong one. A timeout isn't an answer, as in
  word mode (D4): it measures speed more than memory.
- **Today's grammar:** the points due today, then up to 3 new points a
  day (`NEW_POINTS_PER_DAY`, the plan's proposal: fewer than words' 10
  since each point is a bigger idea), in curriculum order.
- **Tales from today's grammar:** a tale needs a different point on each
  line and every part of 起承転結 covered, so reviews rank every point
  (today's grammar, then the weakest seen, then new ones) and the tale
  takes the top 6, or more if those can't fill every part
  (`tale.ts: makeTaleFromRanking`). Checked: 7 of the 210 possible
  six-point sets have no twist (転) template. A first day starts on the
  first 6 points in the curriculum; only 3 of them count as the day's new
  points.
- **On screen:** the side panel shows today's grammar and points known
  (the word mode's `DailyBar`, now shared). "End run" shows the results:
  score, best combo, lines right, grammar seen and known, and today's
  progress, then Play again or Change mode. The mode card now says
  "Counts toward your grammar reviews".
- **Not yet:** grammar on the stats page, in the export and in the
  daily check-up (each touches shared screens, so each is its own
  decision); the haiku close and the leaderboard (G4).
- **Beat:** grammar events in the word log with a kind field (word
  memory would need to filter them everywhere, and one missed filter
  corrupts word reviews); a copy of the Leitner code for grammar (two
  schedules that could drift apart); counting timeouts as misses (would
  punish slow readers, unlike word mode).

### D58: Bunpou's stage, performance and chapters (G3, 2026-11-24)

The rakugo stage the plan describes, built with the game's own pixel-art
approach and synth sounds, since there's no art or audio for it yet.

- **The stage** sits above the table: the storyteller kneeling on his
  cushion in a warm spotlight, one sealed slip per line built (the player
  sees how far the tale has got, not the story), and a packed house of
  dark silhouettes seen from behind: tiers of heads in three shades (far,
  middle, near) that fill the stage to the top at the sides and part in a
  U around him, like raked seating round a stage (after playtest
  feedback: a few detailed audience members looked sparse, and a
  straight row didn't feel like a crowd round a storyteller). The storyteller is a chibi rakugo performer in
  haori and hakama, the closed fan held upright, drawn in the game's
  palette in the style of a reference picture from playtesting, not copied from it. The storyteller and slip are
  letter grids like the icons (D43), drawn for this game, with
  `pixel-icons.ts: gridPaths` now serving both; the crowd is built from
  six head shapes by a seeded generator (`crowd-strip.ts`), so it's the
  same every time, and drawn as three layers the stage's own shape,
  covering it without stretching its pixels. The stage is taller than the
  first draft, as allowed, to fit the crowd and the light.
- **Forgetting a line:** when a line times out, the storyteller
  scratches his head and says えーと…, as the plan's item 8 asks.
- **The performance** replaces the plain list (D56) after a tale's last
  line: a three-pluck shamisen opening, then each line told in turn,
  unrolling a slip. A right line gets the fan raised and a fan tap; a
  wrong one is told as built, he trips, and its fix shows; a forgotten
  one gets えーと…. Then the crowd reacts by the plan's table: every line
  right, 大爆笑 with arms thrown up and the rows hopping (louder at an S
  rank or above);
  one wrong, あはは; two, くすくす; three or more, しーん with a cough and
  someone on a phone. Skip jumps to the reaction. The lines scroll inside
  their panel so the buttons stay on screen.
- **Chapters:** every 3 tales, the chapter (第1章) shows as a scroll with
  each tale (其の一…) and its lines.
- **Dealing:** a line's tiles are dealt in like word mode's cards, one
  after another from above with the card-landing tap rising in pitch
  (asked for in playtesting); a tile taken back just reappears.
- **Sounds:** fan tap, slip fold, shamisen pluck, three laugh tiers and
  a cough, all ZzFX synth stand-ins shaped without recordings, to be
  replaced or tuned by ear.
- **Not yet:** the storyteller's bow and the haiku card that close the
  show, and the leaderboard (G4).
- **Beat:** a separate art pass before building (the plan lists art
  sourcing as open; pixel grids keep the look consistent and can be
  redrawn later without code changes); a full-screen performance
  overlay (hides the side panel's score and progress for no gain).

### D59: Bunpou's close: the bow, the haiku and the leaderboard (G4, 2026-11-24)

The player ends a run whenever they choose, and the show closes as the
plan says.

- **The curtain call:** "End run" has the storyteller bow low to
  applause and say the rakugo closing line, おあとがよろしいようで; red
  pixel curtains then slide in from both sides and meet in the middle
  (asked for in playtesting); then the haiku card is dealt in, and the
  results come after it. Speech and shouts sit in front of the crowd.
- **The haiku:** 24 to collect (`grammar/haiku-bank.ts`): 12 written for
  this game in easy Japanese, and 12 classics by Bashō, Buson and Issa
  from before 1900, which are public domain. Each is tagged with lexicon
  words, and a run closes on one that fits its last tale's setting when
  there is one. None repeats until every one has come up; then the bank
  reshuffles (`grammar/haiku.ts`). The card shows the poet for a classic,
  新しい句！ for a new one, and the collection (句集 2 / 24).
- **The leaderboard:** Bunpou gets its own board, by total run score,
  beside word mode's on the start screen (a Words / Bunpou switch), with
  its own sample players until scores can be shared (D47). The results
  show your best run (★ when it's new) and its rank.
- **Storage:** the collection and the best run are kept in this browser
  like word mode's best score, and "Delete my data" now clears both.
- **Beat:** a dedicated collection page (one more screen before the
  collection has much in it); haiku picked at random (the plan asks for
  one that fits the tale); modern haiku (copyrighted).

### D60: The first slice's 20 grammar points (G5 content, 2026-11-24)

Bunpou now teaches all 20 first-slice points the shelf map marks: the
first 10, plus に (destination), ている, て, てから, が (but), から
(because), なにも・だれも＋ない, てください, ませんか and よ. That's 62
templates (3–4 a point, on the shelves the map allows), short of the
plan's "about 70"; a fourth template for the thinner points can follow
the native check.

- **Pattern points:** the plan says only the tested grammar is split into
  tiles and everything else comes as ready-made phrases. For the 9
  points that test a pattern rather than a particle (`PATTERN_POINTS`),
  only the pattern's pieces are loose: 待って｜います, 食べて｜から、,
  行きません｜か, 駅に行きました｜が、. Their tile rule (`kindProblems`):
  3–5 tiles, at least 2 units, one split into pattern pieces, and a
  predicate of at most 2 tiles. Particle points keep D55's rule (2 loose
  noun+particle pairs, a one-tile predicate).
- **The て-form:** the conjugator gains it (`conjugate.ts: conjugateTe`),
  with 行く's 行って and 来る's 来て; ている, てから and てください are the
  て-form plus a fixed tile, so no other forms were needed.
- **Fixed openings:** a が or でも、 clause that must open its line is a
  fixed unit, so the order checker doesn't accept a reading that turns
  the meaning around.
- **Order:** the 10 new points follow the first 10 in the curriculum, in
  the plan's order, so they arrive through the daily reviews, 3 a day.
- **Checked:** the grammar check passes against the local shelf map; 50
  generated tales were read for this decision, and every new template
  reads as natural Japanese, if the stories are odd (as the plan
  accepts). The native-speaker check the plan asks for is still to come
  (arranged outside the code); the tales for it are in
  `report-output/bunpou-tales-g5.txt` (not committed).
- **Beat:** quoting speech in 「」 (sentenceText ends every line with 。,
  which reads oddly after 」); kanji for 何も・誰も (N5 learners usually
  meet them in kana); plain-form から clauses (one politeness level per
  tale, as the plan says).


### D61: A finish line for every run, and a goal for every level (2026-11-26)

From playtesting: "don't just make it endless". Endless runs ranked by
total score rewarded whoever played longest, which works against the
15- and 30-minute nudges and the daily cap (D19).

- **Finish lines:** a word-mode run ends when today's deck is cleared
  (the reviews due plus the day's new words): the pot is banked and the
  results show, and the player can keep practising
  (`composables/useDeckFinish.ts`). A kanji run is a sheet of 10 kanji
  (`kanji/useKanjiSheet.ts`). A Bunpou show is one chapter of three tales,
  then the curtain call (D59); "End run" still leaves early. All three end
  on one results card (`ui/RunResults.vue`).
- **Level goals,** on each mode's card on the start screen
  (`memory/level-goals.ts`): words known; kanji mastered (every reading
  found with no wrong pick on two separate days, like a known word); and
  Bunpou's rakugo ranks, 前座, then 二ツ目 from a third of the grammar,
  then 真打 for all of it. A tick lights at each quarter, after the
  goal-gradient effect (Kivetz, Urminsky & Zheng 2006).
- **Kanji mastery needs a record:** kanji rounds go to the play log
  (`memory/play-log.ts`), not to the review events, so D37 still holds:
  the reviews and the school's measures don't read kanji mode.
- **Beat:** a fixed 30-match word run (it wouldn't follow the day's
  reviews); a ranked total for each mode (ranking moves to the game-over
  mode); sheets weighted toward kanji not yet mastered (left for later).

### D62: The dojo, a game-over mode, and a board for every mode (2026-11-26)

From playtesting: "make another mode that has a game over". On screen it's
called **Practice mode** (renamed in playtesting); the code keeps the
name `dojo`. Kanji mode's card no longer says "practice only", to avoid
the clash.

- **What it asks:** only what the player has met, so it tests rather
  than teaches (`dojo/dojo-questions.ts`): words matched before (the
  reading among four, the word's own decoys first), kanji found perfectly
  at least once (a hand of eight readings), and grammar points built right
  (one Bunpou sentence). Repeats are allowed. It opens once 10 words have
  been matched, and says so until then.
- **Reused boards:** word and kanji questions are dealt as cards on kanji
  mode's board, and grammar questions on Bunpou's tile board, as asked in
  playtesting; one wrong card is a miss.
- **Three lanterns:** a miss or a timeout puts one out
  (`dojo/dojo-run.ts`); the score is the right answers. Lit and dim
  lanterns are drawn in the game's palette after a reference from
  playtesting.
- **The timer** tightens every 10 right answers through five stages,
  then holds: words 20, 17, 15, 13, 12 s; kanji 60, 52, 45, 40, 36 s; a
  grammar sentence 30, 26, 23, 20, 18 s (the whole sentence). The floor
  is sized for a slow reader who knows the answer: the game should help
  people learn, not shut out slow readers.
- **Game over** recaps the score, the best combo and the stage, with a
  quote from a historic figure or a well-known character, each with its
  source (`dojo/quotes.ts`), then Restart or Quit to main menu.
- **Logging:** runs go to the play log (streak, calendar, boards);
  nothing goes to the reviews, since a timed test isn't practice.
- **Leaderboards:** a board for each mode, ranking its best run (word
  mode's coins, kanji mode's best sheet, Bunpou's best show, the dojo's
  best run), and a Total board, the sum of each mode's best, which
  rewards being good at everything rather than playing longest
  (`leaderboard/leaderboard.ts: boardBests`). Bests kept before the play
  log existed still count.
- **Beat:** one board for the dojo only (asked for a board per mode and
  a total instead); a total of every point ever scored (rewards time
  played); a speed-up with no floor (unfair to slow readers); new
  question screens of its own (the other modes' boards look and feel the
  same).

### D63: The game fits a phone (2026-11-26)

The game was laptop-only (D30). From playtesting, and since the school's
students may play on phones, it now fits a phone-width screen too, with
desktop unchanged.

- **Below the lg breakpoint:** the start screen stacks (leaderboard,
  streak, modes); each mode's board fills the screen and its side panel is
  a drawer folded away to the left, slid open or closed by a tab on its
  edge (`ui/SidePanel.vue`), asked for in playtesting for phones and
  tablets; word mode's set timer also shows above its cards, and the
  pause button sits fixed at the top right (`ui/FloatingPause.vue`).
- **Cards and tiles:** card rows cap their height by the window's width
  as well as its height. On a phone the hand is a grid of cards side by
  side, not an overlapping fan (kanji mode 4 by 2, word mode 3 by 2, on
  tablets too, with bigger cards), so
  each reading is big enough to read and tap (playtest: the fan was hard
  to read and too small to tap). Bunpou's tiles shrink with their text. The calendar shows 12
  weeks.
- **One screen, no scrolling during play:** on phones and tablets each
  board's cards are capped by the screen's height too, so the cards you
  play fit on one screen (checked at 375×812, 375×667 and 768×1024);
  Bunpou's stage is shorter on a phone. On phones and tablets the deck is
  gone and each card slides up from under the screen; desktop keeps it. Card
  text always stays on one line, shrinking to fit.
- **Not yet checked on a real phone:** touch drags (throwing a card) work
  in a phone emulator, but a playtest on a real device is still to come.
- **Beat:** a separate phone app (more to keep in step); hiding modes on a
  phone (every mode fits).

### D64: A light first load, other screens on demand (2026-11-26)

From playtesting: "since it's a game the components need to be light and
load fast". Measured on the local build: the game's code was one 535 KB
file (181 KB compressed), parsed before the start screen showed.

- **Screens on demand** (`lazy-screens.ts`): kanji mode, Bunpou (with its
  templates and stage), the dojo, and the stats, settings, research and
  about pages are their own chunks. The first load is the start screen and
  word mode: 385 KB of code (130 KB compressed) plus the shared animation
  library (28 KB compressed).
- **Prefetched when idle:** once the start screen is up, the other chunks
  are fetched while the browser is free, so opening a mode stays instant:
  measured at 13–83 ms from the tap to the first card, and 11–25 ms back
  to the start screen.
- **The curriculum stands alone** (`grammar/curriculum.ts`), so the start
  screen counts the level's grammar without loading every template.
- **Already light:** the music streams on the first tap; the Japanese font
  comes in about 120 small pieces, of which a page loads only the ones its
  characters need; built files are cached for a year (`public/_headers`).
- **Beat:** splitting word mode too (the most played mode; it would only
  add a fetch to its first tap); a service worker for offline play (more
  to keep in step than the gain for now).

### D65: Grammar on the stats page and in the export; the check-up stays words (2026-11-26)

- **Stats page:** a Grammar section (`components/GrammarStats.vue`,
  `memory/grammar-stats.ts`): points known and seen, sentences right
  today and overall, the points missed most by their pattern, and the
  kinds of mistake (the rule a wrong order broke).
- **Export:** format 2 adds the grammar log (`memory/export.ts`), so a
  teacher sees Bunpou too; the report reads both formats.
- **Check-up:** stays words only (playtest decision). Grammar there would
  either measure only before and after, or hold new grammar points back
  from Bunpou for 3 days to compare, which slows a player's grammar. The
  stats page and the export already show grammar.
- **Beat:** grammar in the check-up, before and after only; the full
  design with hold-backs.

### D66: Results against the best, a head start, and a fair word board (2026-11-26)

Three things the research page claimed, or the boards needed, that the
game didn't yet do:

- **How close a run came** (the near-miss effect, Clark et al. 2009): the
  results card says "New best! Up from 20.", "That ties your best" or
  "3 away from your best (20).", on practice mode, kanji mode's sheet and
  word mode's deck (`memory/best-comparison.ts`,
  `composables/usePreviousBest.ts`).
- **A head start** (the endowed-progress effect, Nunes & Drèze 2006):
  words answered right in their check-up before first play count as known,
  on the start screen's goal and in word mode alike
  (`word-memory.ts: isWordKnown`). Display only: the review schedule still
  ignores check-ups (C4).
- **A fair word board:** a word run counts toward the best and the board
  only until today's deck is cleared, the pot banked at that moment
  included (`useDeckFinish.isRanked`); practice after it doesn't count.

### D67: A reachable kanji goal, and sheets that balance learning with review (2026-11-26)

- **The goal counts the level's official kanji list.** It counted every
  kanji the level's words use, 405 for N5, most of them from harder
  levels' lists (欲 in ほしい). It now counts the kanji OpenJLPT tags as on
  the level's own list (Jonathan Waller's lists, not "supplementary"):
  78 for N5, the 79th being in no N5 word. The deck builder carries the tag
  (`KanjiNote.listLevel`); the other kanji are still played.
- **Each sheet balances learning with review** (`kanji/sheet-mix.ts`):
  every third kanji (3 of a sheet's 10) is one the player has mastered, so
  it stays fresh; the rest are still being learned, from the official list
  3 times in 4, so the goal fills, and from the level's other kanji
  otherwise. A kind with nothing left falls back to the next (review →
  list → other), so a new player only learns.
- Considered: drawing only from the list until it's mastered (it hides most
  of the kanji the level's words use for weeks), and plain weights (a
  sheet's mix would vary too much to explain). Playtest decision:
  "a balance of that would be nice".

### D68: An accessibility pass: contrast and keyboard focus (2026-11-26)

Checked against WCAG 2.1 AA in the built game, at desktop and phone sizes:
contrast measured from the colours on screen, every button checked for a
name, then keyboard focus by hand.

- **Steel is a shade darker** (`#457b9d` → `#3c7090`, `--color-steel`):
  white on steel was 4.3:1, under AA's 4.5:1, on every steel button, the
  leaderboard and the Kanji card; it's 5.0:1 now. Faded white text on
  steel (80%, 70%) can't pass on any steel this light, so it's full white
  there; "sample data" on the wood goes from 50% to 60% white.
- **Keyboard focus shows.** The pixel buttons' stepped corners are a
  clip-path, which cut off the browser's focus outline, so nothing showed
  where focus was. A ring is drawn inside each pixel button in its text
  colour, and the cards get a lamp-yellow ring.
- Already fine: every control has a name, Japanese text is marked `lang`,
  motion follows the reduce-motion setting, and the timed modes pause (the
  timers are part of the game, which WCAG allows when they can be paused).
- Not covered: a screen reader run with VoiceOver, and playing a whole run
  by keyboard alone; both are worth a session on a real device.

### D69: Practice mode has no timer (2026-11-26)

Practice mode's questions aren't timed. They had a timer that tightened
through five stages to a floor (D62's table: word 20 s down to 12 s, kanji
60 s to 36 s, grammar 30 s to 18 s). Playtest decision: "no timer on
practice mode thats just cruel".

- A run still ends after three misses, or at End run. The score is still
  the right answers, so the board ranks how much a player knows, not how
  long they play.
- The stages went with the timer, since tightening it was all they did.
  So did the timeout handling: there's nothing left to run out.
- Pause stays. It hides the question and stops play time counting toward
  the nudges and the daily cap.
- Trade-off: with no clock, a player could look answers up. The board
  ranks sample players for now; revisit this with real leaderboards.

### D70: Clearing today's deck shows a banner, and every word coin counts (2026-11-26)

Playtest: today's deck as a finish line "seems like a bad feature i felt
like it cut me off more than anything". This changes D61 for word mode
and undoes D66's fair word board.

- **No stop.** Clearing today's deck shows a banner for a few seconds,
  "今日の分 完了 · Today's deck done!", with the cleared set's applause,
  and play goes on (`useDeckFinish.ts`, `ui/FloatingBanner.vue`). Word
  mode's results come only from End run: "Run ended", the pot banked.
- **Every coin counts.** A run's best is everything it banks; coins after
  the deck is cleared are no longer set aside as practice. The daily time
  cap and the break nudges still stop marathon runs.
- Considered: no banner at all (the side panel's daily bar fills anyway),
  and keeping the results screen. The owner chose the banner, and counting
  every coin.

### D71: The Total board leaves practice mode out (2026-11-26)

The Total board adds up the best runs of Words, Kanji and Bunpou only
(`TOTAL_BOARDS`). Practice mode keeps its own board but no longer counts
toward the Total. Playtest decision: "leave the practice leaderboard out
of the total since it has no timer". Since D69 its questions aren't
timed, so a player could take as long as they like, or look answers up,
and its scores aren't on the same footing as the timed modes'.

### D72: Kanji mode gets lanterns (2026-11-26)

Kanji mode had no way to fail: a sheet always ran its 10 kanji. It now
has 3 lanterns, like practice mode (`game/lanterns.ts`, shared). A kanji
whose answers are revealed with readings still unfound puts one out.
Wrong picks alone don't, if every reading is still found, which is the
rule the applause follows. The sheet ends early when the last one goes
out, and its results say "Lanterns out".

- Kept untimed, in line with D69 (no timers that rush slow readers).
- On a phone or a tablet, both modes show a compact lantern row above the
  board, so the lives are in sight without opening the side drawer
  (playtest decision).
- Considered: a timer per kanji (rejected, as above), and failing a kanji
  on any wrong pick (too harsh next to "3 wrong picks allowed").


### D73: The interface in English and Indonesian, with vue-i18n (2026-11-26)

The school's players read Indonesian first, and the client quote's
acceptance tests need the interface in Indonesian and English. Every
interface word now comes from message files (`src/i18n/en/`, `src/i18n/id/`),
one file per part of the game. The language switch is in Settings. A first
visit follows the browser's language, and the choice is remembered in this
browser like the other preferences. The page's `lang` attribute follows it.

- **Library: vue-i18n** (MIT, the Vue team's own i18n library, Composition
  API mode). Approved by the owner, 2026-11-26.
  - Rejected: a hand-written dictionary. It's lighter, but plurals,
    placeholders and fallbacks would be ours to maintain: the kind of
    hand-rolled framework the workspace rules warn against.
- **Messages are TypeScript, not JSON.** The Indonesian files are typed
  against the English ones, so a missing key fails `typecheck`. A test
  checks that every key the code names exists, and that each translation
  keeps its English `{placeholders}`.
- **What stays as it is:**
  - the Japanese being learned;
  - word meanings, which come from JMdict, and JMdict has no Indonesian
    glosses (the client's own database can supply them);
  - the research papers' titles.

### D74: The research page cites the quote's 8 checked sources (2026-11-26)

The research page listed 19 sources, many of them never checked against
their full text. It now cites exactly the 8 that the client quote's
section 2f keeps, each checked against a free copy of the full text.
Each card shows:

- the claim;
- a plain-English paragraph on what the study did and found;
- where in the paper the claim is, with a link to the free copy;
- where the game uses it.

The intro adds the quote's disclaimer: the research explains the design
and is no guarantee of learning results or exam scores.

- **Removed by the owner:**
  - Kahneman & Tversky (1979): no free copy;
  - Csikszentmihalyi (1990): a book, only partly checkable;
  - Landers et al. (2017): abstract only.
  The features they backed stay: the pot, levels that speed up, and a board
  per mode. Sailer & Homner covers leaderboards in general.
- **Also off the page:** the 14 other sources the quote doesn't cite, among
  them the gambling and dopamine studies. They no longer back a claim the
  page makes.
- **Caveats kept, as in the quote:**
  - Cepeda backs spacing in general, not the game's growing gaps;
  - the weekly rest day is like Silverman & Barasch's repair, but not what
    they tested;
  - Moreno & Mayer used narrated lessons.
- **Ryan et al. (2006):** the printed issue is pages 344–360 (the DOI
  registry). The free copy is Springer's early online version, numbered
  347–363, so the card gives both, as it does for Silverman & Barasch's
  manuscript. The quote was corrected to match.

### D75: Kanji get their own reviews (2026-11-26)

Kanji mode used to change no reviews (D37), so a missed kanji came back
only by chance. Now each kanji has spaced reviews on the same Leitner
schedule as words and grammar points (`memory/leitner.ts: afterAnswer`),
rebuilt from the kanji rounds the play log already keeps. Nothing new is
stored, and no migration is needed.

- **The answer:** a perfect round is right and moves the kanji up a box.
  Any other round is wrong and sends it back to box 1, so it's due
  tomorrow.
- **The sheet (D67 kept):**
  - every third round still reviews, now drawing kanji that are due;
  - the other rounds draw kanji never played, from the official list 3
    times in 4;
  - played kanji that aren't due rest, and so does any kanji already
    dealt in this run. They come up only when nothing else is left.
- **Still apart from the school's data (D37 kept):** kanji rounds go to
  the play log only, never to the word events the reports and the export
  read. The word reviews don't change.
- **The kanji goal is unchanged:** a kanji counts as mastered after
  perfect rounds on 2 separate days (`level-goals.ts: masteredKanji`).
- Owner's request (2026-11-26).
- **Considered:**
  - letting due kanji take more than every third round. Rejected: it would
    undo D67's balance, and a backlog could crowd out new kanji;
  - counting kanji answers toward the words that use them. Rejected: it
    mixes the two and changes what the school measures.

### D76: The demo sits behind a password, on the owner's server (2026-11-27)

The demo was open to anyone with the link. The owner wants the online
demo behind a password that only the portfolio shows: a visitor who finds
the portfolio can play, and nobody gets in without the password. The code
stays public (the owner's choice), so the lock covers the hosted demo, not
the source.

- **Where:** the owner's server, in its own small Caddy container
  (`ops/compose.yaml`), hardened like the portfolio's. The server's front
  Caddy only forwards the demo's address to it, so setting it up or
  changing the password never touches another site. GitHub Pages only
  serves files, so it can't check a password, and its deploy workflow is
  gone.
- **How:** Caddy's built-in `basic_auth` (`ops/demo.Caddyfile`). Every
  request, including the JS, the decks and the sounds, needs the
  username `demo` and the password, or Caddy answers 401.
- **The password:** only a bcrypt hash is kept, in a root-only file on the
  server. The owner sets or changes it with one command,
  `sudo juku-demo-password` (`ops/set-demo-password.sh`). It checks the
  config and reloads the demo's Caddy, and puts the old password back if
  either step fails. Before the first password is set, the lock has no
  accounts and refuses everyone.
- **A trap avoided:** every response says `Cache-Control: private`.
  Cloudflare caches a response marked `public` even when the request
  carried a password, and would hand that copy to anyone.
- **The bundle:** `npm run demo:bundle`, with the sample week on (as on
  Pages), and without the private `public/local/` or its table picture, so
  the table shows the moving swirl.
- Owner's request (2026-11-27); the owner chose the server over Cloudflare.
- **Considered:**
  - the lock inside the front Caddy. Rejected: adding the folders means
    recreating it, which takes every site down for a moment, and each
    password change would reload it;
  - a Cloudflare Worker with a styled lock page. Rejected: the owner
    prefers his server;
  - a small lock service behind Caddy's `forward_auth`, for a styled page.
    Rejected: another app to run and maintain on a small server;
  - the caddy-security plugin. Rejected: it needs a custom Caddy build;
  - StatiCrypt on GitHub Pages. Rejected: the page is decrypted in the
    browser and the decks stay downloadable, so it can be bypassed;
  - Cloudflare Access. Rejected: it asks visitors for an email address, not
    a shared password.
