# Phase 2: Requirements and constraints

Priorities use MoSCoW: **Must**, **Should**, **Could**, **Won't (now)**.
Every number below is a starting value. Numbers live in one settings file
(`game/tuning.ts`), so the playtest can tune them. Decision numbers (D1…)
point to `phase-5-decisions.md`.

## The loop (L)

**L1. The board (Must, D1).** The top row has 5 word cards, showing the
word's kanji spelling. The bottom row has 6 reading cards in hiragana or
katakana: the 5 answers, shuffled, plus 1 decoy. Tap the cards in either
order: a word then a reading, or a reading then a word.

**L2. A valid set (Must).** The deal checks every set, so that no match is
ambiguous:
- no two cards in a set share a spelling or a reading (橋 and 箸 are both
  はし, so they never share a set);
- the decoy's reading is not the reading of any word in the set;
- the decoy is built to test one error type (R8), such as がこう for
  がっこう, a dropped small っ. The types rotate evenly across sets, so the
  error rates of different types can be compared fairly;
- kana-only words (これ, ソース) are left out, because their reading *is*
  their spelling;
- each word shows one reading: OpenJLPT's main one;
- no card shows any **other** valid reading of a word in the set,
  whether as a decoy or as another word's reading. 今日 is read きょう,
  but also こんにち, so こんにち must never appear beside 今日.

**L3. A correct match (Must).** The pair flies off. The combo goes up by 1.
If the match is clean (no miss and no peek on that word this set), the
word's difficulty tag is added to the set's multiplier (L7).

**L4. A wrong tap (Must, D7).** For example, 学校 then じかん:
- both cards shake, and 学校's real reading (がっこう) flashes;
- the combo goes to 0, with a drop animation;
- the level drops by one, or from 5 to 1 (L5);
- the pair stays on the board, to be matched properly;
- the review engine records 学校 as a miss (R2), and 学校 comes back within
  the next 2 sets (R3).

Only the first card tapped counts as the miss. じかん belongs to another
word, which did nothing wrong.

**L5. Levels (Must, D2).** Levels run from 1 to 5. The level goes up by 1
each time the combo reaches a multiple of 10 (10, 20, 30, 40), up to 5. A
miss or a timeout drops the level by one, but at level 5 it drops to
level 1.

**L6. The set timer (Must, D3, D4).** The time per set is 40, 30, 22, 17
and 12 seconds at levels 1 to 5. That's about 8 seconds per card at
level 1 and 2.5 at level 5. When time runs out:
- the unmatched pairs are shown briefly, then cleared;
- the combo goes to 0 and the level drops, as for a miss;
- the unmatched words are **not** recorded as forgotten. A timeout
  measures reading speed more than memory;
- a new set deals in.

**L7. The set score (Must, D5).** When a set clears, it scores
`chips × multiplier`, counted up on screen:
- **chips:** 10 per clean match, plus 1 per whole second left;
- **multiplier:** `level × (1 + the sum of the clean matches' tags)`. The
  tags stack by adding up within the set, and the level multiplies the
  total.

Worked example: at level 3, five clean matches tagged +0.1, +0.2, +0.1,
+0.5 and +0.3 give a multiplier of 3 × 2.2 = 6.6. Five clean matches with
8 seconds left give 58 chips. The set scores 58 × 6.6 ≈ 383. The formula
is our own (D22).

**L8. Difficulty tags (Must, D6).** Each word card shows a small tag,
from +0.1× to +0.5× in steps of 0.1:
- it starts from a guess based on the data (R5);
- it then moves with the player's own misses on that word;
- a word you keep missing is worth more, so the score rewards beating
  your weak words.

**L9. Pause and flip (Must, D8).** A pause button freezes the timer and
the animations. No menu opens, and the board stays in place.
- Tap any card to flip it. Its back shows the reading, the English
  meaning, an example sentence with furigana, and the JLPT level.
- **Peeking:** flipping a card that isn't matched yet marks that word with
  an eye. Matching a peeked word gives no chips, tag or combo point, but
  doesn't break the combo either. The review engine records it as a miss,
  because you didn't know it.
- **The missed tray:** a strip beside the board holds this run's last 8
  missed words. They can be flipped freely while paused.
- **Card faces while paused (settled):** the board
  hides its card faces while paused, until you flip one. Otherwise pausing
  stops the clock while you keep thinking, which would make the timer
  pointless.

**L10. The daily deck (Must, D9).** Today's deck is the words due for
review (R2), plus 10 new words at the player's level. A bar shows
progress, for example "Today 23 / 40". Clearing the deck ticks today on a
calendar. Play then carries on (L11).

**L11. Endless play (Must, D10).** After the daily deck, sets mix words
already seen, weighted toward the ones missed most, with about 1 new word
per set.

**L12. Bests (Must).** The game keeps the best combo and the best set
score, overall and for today. The calendar shows the days played, and
"5 of the last 7 days" rather than a streak that breaks. A missed day
costs nothing (D9).

**L13. Animation (Should, D12).** Cards deal in, flip, and fly off when
matched. The combo counter pops, there's a burst at each level-up, cards
shake on a miss, the combo breaks visibly, and the score counts up. Only
`transform` and `opacity` animate, so phones keep 60 fps. The game follows
the system's reduce-motion setting.

**L14. Sound (Could, D23).** Short sound effects from CC0 packs, with a
mute toggle. Sound is off until the player first taps.

**L15. Level choice (Must).** On first launch, the player picks a JLPT
level (N5 to N1). It can be changed in the settings. Decks draw words from
that level.

## The review engine (R)

**R1. The interface (Must, D13).** Game code talks to a `ReviewEngine`
interface shaped like Juku's engine API (`recommend_words`,
`record_quiz_answer`, `get_mistakes`, `get_progress`), so Juku's API can
replace it after the playtest.

**R2. Scheduling (Must, D13).** Juku's 5 Leitner boxes. A word waits 1, 2,
4, 8 or 16 days before it's due again:
- a miss or a peek sends the word back to box 1;
- a correct match moves it up one box, **at most once per word per local
  day**, so extra play can't skip the spacing.

**R3. Comebacks (Must).** A word missed in this run is dealt again within
the next 2 sets.

**R4. Events first (Must).** Every match, miss, peek, timeout and
check-up answer is appended to an event log in the browser's storage
(D14). Word state is derived from the log. A test checks that the state
updated event by event equals the state rebuilt from the whole log, as
Juku's FF3 check does.

**R5. Difficulty (Must, D6).** A word's chance of being missed starts from
a guess: JLPT level, the rarest kanji's frequency rank, and an irregular
reading flag (今日 きょう, 大人 おとな). Then it's updated with that
player's own record: `(misses + k × guess) / (attempts + k)`, with `k = 5`
to start. That chance maps to the tag (L8).

## Score versus ability (D25)

The score is for motivation, not measurement. Difficulty tags differ for
each player, so two players' scores can't be compared, and they never
are: there are no leaderboards. A learner's ability is measured only from
the event log (R6), the "words known" count (R7) and the check-up (C).

**R6. Detailed events (Must, D26).** Every event records the fields below.
They're cheap to capture, and impossible to recover later. Events live in
memory from slice 1, and in storage from slice 3.

| Field | Why |
|---|---|
| `event_id` (random UUID), `schema_version` | Merging exports without double counting, and reading old exports after the format changes |
| `player_id` (random, anonymous), `class_code` (optional, R9), `session_id` | Linking events up, with no names |
| `at` (local time, with timezone) | Days, sessions, time of day, and gaps between visits |
| `kind`: match, miss, peek, timeout, check-up answer, pause, session start or end | What happened |
| `word_id`, `first_card`, `second_card` | Which word, and what it was confused with |
| `wrong_card_role`: the decoy, or another word in the set | A confusion with the decoy tests an error type. A confusion with another word is a real mix-up between two words |
| `error_type` (R8) | Why the miss happened |
| `ms_since_set_shown`, `ms_since_last_action` | How fast the word was recalled |
| `level`, `seconds_left`, `set_index`, `cards_left_in_set` | Context, so speed under pressure isn't mistaken for ability |
| `outcome`: clean, after a miss, peeked | Accuracy, kept apart from guessing |
| `times_seen_before`, `days_since_last_seen`, `box_before`, `tag_shown` | The forgetting curve, and checking the difficulty model |
| `check_up_role`: before, after or held back (check-up answers only) | The headline measure |

**R7. Words known (Must).** The home screen shows an honest ability number,
for example "Words known: 312 / 700 (N5)", per level. A word counts as
known after clean matches on 2 separate local days (Juku's LE1 rule).
Peeks and matches after a miss don't count.

**R8. Error types (Must, D27).** Each miss gets an error type, worked out
from the word and the reading that was picked:
- a long vowel (がっこう / がこう);
- a small っ;
- dakuten or handakuten (はし / ばし);
- a small ゃ, ゅ or ょ;
- the same kanji with another reading (生: せい / しょう);
- a look-alike kanji (待 / 持: a shared part, from KANJIDIC2);
- a mix-up with another word in the set;
- other.

Slice 0's spike checks that this can be computed. If a type can't be,
it's dropped and not guessed.

**R9. Class code (Should).** On first launch, the player can type an
optional class code given by the teacher, such as "N5-SAT". It goes into
every event, so reports can be split by class. No names.

## The check-up (C)

**C1. Optional and daily (Must, D17).** Offered once a day, and easy to
skip. 5 questions. Each shows a kanji word and 4 readings, with an
8-second timer. Running out of time counts as wrong.

**C2. The question mix (Must, D16).** Each check-up has:
- 2 **before** questions: words about to enter play, not yet seen;
- 2 **after** questions: words checked before, then played, with the
  first play at least 1 day ago;
- 1 **held-back** question: a word checked before at least 1 day ago,
  but not played yet.

When a word gets a before question, it's randomly assigned: 2 in 3 enter
play as normal, and 1 in 3 is held back for 3 days, then enters play.

**C3. No filtering (Must).** A word answered correctly in its before
question still enters play. Dropping known words would bias the
measurement.

**C4. No side effects (Must).** Check-up answers are logged, but they
don't change the review schedule or the difficulty tags.

**C5. Wrong options (Must).** The 3 wrong readings come from words at the
same level with similar readings, the way Juku's quiz picks its options.

## Data (D)

**D1. Decks (Must, D15).** A build script reads OpenJLPT, pinned to
commit `bf4e1ee` (the same as Juku) and checked against its checksum. It
writes one deck file per JLPT level, holding the fields the game needs.
Decks are generated at build time and not committed.

**D2. Attribution (Must).** An "About the data" page credits OpenJLPT,
JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's JLPT lists and Tatoeba, as
OpenJLPT's NOTICE asks (Juku's wording). Deck files are CC BY-SA 4.0.

**D3. The school's lists (Could).** Import a CSV with spelling, reading,
meaning and level, once the school confirms it owns the list.

## Wellbeing (W)

**W1. A soft stop (Must, D19).** After 15 minutes of play, a friendly
message says it's a good place to stop. It's easy to dismiss, and it
comes back at 30 minutes.

**W2. A cap for minors (Must if minors play, D19).** A daily play limit,
set in the deploy's configuration (no admin screen). When the limit is
reached, play stops until tomorrow. The check-up stays open.

**W3. Never.** No ads, purchases, loot boxes, paid or random rewards,
energy systems, or leaderboards with names.

## Admin, barebones (A)

**A1. Export (Should, D18).** A settings button downloads this browser's
event log as an anonymous JSON file, with a random player ID and no
names.

**A2. Reports (Should, D18, D28).** A script in the repo reads a folder of
exports and writes three reports as static files, laid out in phase 3's
"Decision report":
- a **class report**: what to re-teach, and who may need help;
- an **ability report per learner**, by anonymous ID: words known per
  level, weak words and their usual confusions, error types, recall speed
  over time, and how well words are held after 1, 4 and 8 days;
- the **measurement report**: the headline, S1–S6, and the guardrails.

It also writes a CSV of the events, so the school can explore the data in
a spreadsheet.

**A4. Data quality (Must, with A2).** Merged exports are deduplicated by
`event_id`. Old `schema_version`s are still read. Gaps and clock jumps are
flagged. Every figure shows how many learners and answers it rests on,
and a figure that rests on too few is held back (phase 3).

**A3. A backend (Won't now).** A tiny backend for live class stats is
deferred until after the playtest, and not planned yet.

## Non-functional (N)

- **N1. Fast:** first load in under 2 s on a mid-range Android phone over
  4G. JavaScript under 200 KB gzipped, decks not counted. Only the
  player's level deck loads.
- **N2. Phone first:** portrait from 360 px wide, and laptops too. Touch
  and mouse. Tap targets at least 44 px.
- **N3. Japanese text:** a system font stack (Hiragino, Noto Sans JP,
  Yu Gothic), with no webfont download.
- **N4. Accessible:** feedback never relies on colour alone (shake plus an
  icon), text contrast is readable, and the game follows reduce-motion.
  Keyboard play on laptops is Could.
- **N5. Private:** no accounts, no names, no third-party analytics. Data
  stays in the browser until the player exports it.
  - The player's anonymous ID is shown in the settings. If the school
    wants follow-up with named learners, the learner tells the teacher
    their ID, and that mapping stays with the school, never in our data.
  - The export screen says in plain words what the file contains.
  - A "Delete my data" button clears this browser's data.
  - If minors play, the school handles consent from parents or
    guardians before collecting exports.
- **N6. Works offline mid-run:** once a deck has loaded, a dropped
  connection doesn't stop play. Installing it as an app (PWA) is Could.
- **N7. Browsers:** the last 2 versions of Chrome, Safari on iOS, and
  Firefox.
- **N8. Code rules:** `~/Desktop/my-kerjaan-aku/CLAUDE.md` in full:
  strict TypeScript, ESLint `complexity`, `max-lines-per-function` and
  `max-depth` in CI, size limits, `docs/guide.md`, and a README layout
  section.

## Constraints

- **$0:** static hosting on a free tier (D20), and no paid services or
  APIs.
- **Licences:** code under a licence of Arthur's choosing (D21). Data
  under CC BY-SA 4.0, with attribution.
- **Original:** see D22.
- **Separate from Juku:** no code, branch or commit in juku-agents. Never
  touch `juku-rehearsal`. Juku's code is reused by porting it, with the
  source commit credited.
- **Portfolio:** the repo stays private until Arthur's friend agrees he
  can show it.
