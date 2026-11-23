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
pixel levels; 70 was chosen, clearly pixelated but easy to read, which
matters for learners. It covers JIS levels 1 to 4, so it replaces
DotGothic16 (D31) and that package is removed.

The npm package (@lihbr/kuronuri) splits the font into character slices,
so a browser downloads only the slices a page shows. Its stylesheet also
carries italic and bold, three times the size (89 KB against 29 KB
gzipped), so `npm run fonts` keeps only the regular rules, generated like
the decks and never committed, and `main.ts` loads them after the page
draws.

- **Watch:** the package is new (0.0.3, one author). If it breaks, switch
  the font stacks in `style.css` back to DotGothic16.
- **Beat:** DotGothic16 (D31; Kuronuri's look won); level 100
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

### D49: Buttons play a soft 8-bit pip (settled, 2026-11-23)

Every pixel button plays a sound when pressed. The first try, clicks from
Kenney's UI Audio pack (CC0), sounded too unnatural for the game, and
the wish was something like the menu sounds of handheld monster-catching
games. Those belong to their makers, so the game makes its own in that
style with ZzFX: four short square- and triangle-wave candidates were
tried by ear, and the soft pip won (`click` in `sound/sfx.ts`: a rounded
988 Hz note, 80 ms). Being made in code, it needs no audio file.

- **Beat:** the Kenney clicks (too plain); a two-note "select" blip and a
  harder square pip (the other candidates); copying a commercial game's
  sounds (not ours to ship).

### D50: Looping background music with a volume slider (settled, 2026-11-23)

The game plays "You're Not There" by MagiaZ on a loop, the track chosen
for it, from Pixabay under the Pixabay Content License: free to use in a
game, no credit needed (it's credited in the README anyway). The licence
bars passing the file on by itself, unchanged; shipping it inside the
game is its normal use.

- **Lighter file:** the 7.7 MB, 256 kbps MP3 is re-encoded to 96 kbps AAC
  (`public/music/youre-not-there.m4a`, 2.9 MB, the full 4 minutes) with
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
  4-minute track into memory); shipping the original MP3 (2.6 times the
  size); a separate music on/off button (the slider's 0 does that).

