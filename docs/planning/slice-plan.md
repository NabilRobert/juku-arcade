# Slice plan

Each slice is one branch and one PR. It's playable on Arthur's localhost
before the PR, and it passes lint, types and tests in CI. The loop comes
first: the first slices make it fun to play, and the later ones make it
remember and measure.

Sizes are rough estimates of lines of code, not counting tests and docs.

**Progress (2026-11-21):** slices 0 and 1 are built, with the plan, in
one PR (`feat/first-playable`). Deck findings:
[`docs/spikes/slice-0-decks.md`](../spikes/slice-0-decks.md).

## Slice 0: Skeleton and decks (`build/skeleton`)

- Vue 3, Vite, TypeScript (strict), Tailwind, Vitest, ESLint with
  `complexity`, `max-lines-per-function` and `max-depth`, and Prettier.
- CI in `.github/workflows/ci.yml`. A README with a layout section and
  the run command. A first `docs/guide.md`.
- **The deck script (D15)**, plus the "About the data" page (D2).
- **Spike, in the script:** how many words per level pass L2's rules, and
  the difficulty guess's inputs (R5). Is the irregular-reading flag
  computable from KANJIDIC2 readings, or does it need a short hand-made
  list? Which error types (R8) can be computed, and how many decoys of
  each type can every level supply (D27)?
- **Done when:** CI is green, and `npm run dev` shows one static N5 board
  dealt from the real deck. The spike's counts are in the PR.
- About 250 lines.

## Slice 1: The core loop (`feat/core-loop`)

The heart of the game. No memory between runs yet.

- `src/game/`, with no Vue: the deal with L2's checks, matching, wrong
  taps, combo, levels (with level 5 dropping to 1), the set timer,
  timeouts, and the set score with tags from the data's guess (L1–L8).
- Vue board: tap in either order, a simple shake on a miss, the right
  answer flashing, and the combo, level, timer and set score on screen.
- Decoys that test error types (D27). Every action emits an R6 event,
  kept in memory, with a test that each event has every field.
- Bests kept for the current visit only.
- **Done when:** Arthur plays a 5-minute run on his phone over the local
  network, and each rule in L1–L8 has a test named after it
  (`it("drops from level 5 to level 1 on a miss")`).
- About 450 lines.

## Slice 2: Pause, flip and peek (`feat/pause-flip`)

- The pause button freezes the timer and animations, with no menu (L9).
- Flipping a card shows its reading, meaning, example and level, plus
  each kanji's full reading list with this word's reading highlighted,
  and 2–3 other words that use it (D29). The deck script adds the kanji
  readings from KANJIDIC2, through OpenJLPT.
- The peek rule, the eye mark, and the missed tray of the last 8.
- Comebacks within 2 sets (R3).
- Hidden card faces while paused (D8).
- **Done when:** the peek rule's tests pass, and Arthur has tried
  pausing mid-set on his phone.
- About 250 lines.

## Slice 3: Memory (`feat/review-engine`)

- The `ReviewEngine` interface, and the Leitner port from Juku (R1, R2),
  with the source commit credited.
- The Dexie event log, and state derived from it, with a test that
  rebuilding from the log matches (R4).
- The daily deck and its progress bar, endless mixing, and promotion at
  most once a day (L10, L11).
- Learned difficulty tags (R5). The level picker and optional class code
  on first launch (L15, R9).
- "Words known" on the home screen (R7). The player ID in the settings,
  and "Delete my data" (N5).
- Bests and the calendar, kept across visits (L12).
- **Done when:** closing and reopening the browser keeps progress, and a
  word missed today is due tomorrow (a test with a fixed clock).
- About 450 lines.

## Slice 4: Feel (`feat/juice`)

- Motion animations: deal, flip, fly-off, combo pop, level-up burst,
  combo break, and score count-up (L13).
- Reduce motion, the 15-minute nudge (W1), and the minors cap setting
  (W2).
- Sound effects with mute (L14), if time allows.
- **Done when:** a phone holds 60 fps through a level-5 set (Chrome
  DevTools performance trace), and Arthur says it feels good to play.
- About 300 lines.

## Slice 5a: Check-up and export (`feat/check-up`)

- The optional daily check-up: 5 questions, 4 options, 8 seconds, with
  before, after and held-back words assigned at random (C1–C5).
- The export button (A1), with the plain-words explanation (N5).
- **Done when:** a check-up's answers appear in an export with their
  roles, and the random assignment test passes (about 1 in 3 held back,
  with a fixed seed).
- About 250 lines.

## Slice 5b: Reports (`feat/reports`)

- The report script (A2): the class report, ability reports per learner,
  the measurement report, and the CSV, with data quality checks (A4) and
  the reporting rules (phase 3).
- **Simulated players:** a planted play effect is recovered, and zero
  gives "not enough data" or a CI that includes 0. Planted weak words and
  error types appear in the class report's flags.
- **Done when:** the simulated-player tests pass, and Arthur reads the
  class report built from his own play plus simulated classmates and
  finds it useful.
- About 400 lines.

## Slice 6: Playtest (`chore/playtest`)

- Deploy to Cloudflare Pages (D20), after Arthur's OK and the school's
  answers.
- Watch two or three learners play. Tune `tuning.ts` (timer, `k`, tag
  steps, deck size).
- First readout of S1–S6, and of the headline once the minimum data
  exists.
- Then decide: grammar (D11), a backend (D18), or moving to Juku's API
  (R1).

## Merge order

0 → 1 → 2 → 3 → 4 → 5a → 5b → 6. Slice 5b only needs exports, so it
can start once 5a is merged, alongside 4 if 4 runs late. Slices 2 and 3 both build on 1 and touch
different files, so they can run side by side in separate worktrees. Slice
4 goes after both.

## Cut list

If time runs short, cut from the top down:

1. Sound effects (L14).
2. Calendar visuals: keep the "days out of the last 7" count only.
3. Keyboard play, and PWA install.
4. Decks above N4. Ship N5 and N4 first.
5. The missed tray. Keep the comebacks.
6. Score count-up polish. Show the number instantly.
7. Learned difficulty. Keep the data's guess for the tags, and leave S3
   unmeasured.
8. The ability reports per learner. Keep the class report and the CSV.

**Never cut:** the detailed events (R6: they can't be recovered later),
the decoy (D1), the peek rule (D8), timeouts not counting
as forgotten (D4), the check-up with its held-back control (D16), the
wellbeing nudge and minors cap (D19), and attribution (D2).

## After the playtest (not planned)

Grammar mode (D11), a kanji-to-meaning mode (D29), a tiny backend with an admin page (D18), pooling the
class's misses for difficulty (D6), importing the school's lists (D3), and
moving to Juku's API.
