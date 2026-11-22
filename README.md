# juku-arcade

An arcade card game for learning the readings of Japanese words. Match 5
kanji word cards (学校) to their readings (がっこう), with a decoy in the
mix. Combos raise the level, and each level gives less time. There's no
game over.

Built for Japanese schools and their learners, as a static web app with
no server.
The plan, with its measurement plan, decisions and slices, is in
[`docs/planning/`](docs/planning/).

**Status:** slice 6, the playtest. The game is playable and remembers your progress, in
a karuta table look, with a break nudge, an optional daily cap, and an
optional daily check-up that measures whether play improves recall.
Players can export their anonymous data, and a report script turns a
folder of exports into a class report, ability reports, the
measurement report and a play report (S1–S6). The playtest guide, with
the deploy steps, is [`docs/playtest.md`](docs/playtest.md).

## Run it

```bash
npm install
npm run dev
```

`npm run dev` first builds the word decks. On the first run it downloads
the pinned OpenJLPT file (about 6 MB) into `data/raw/`.

For schools where minors play, copy `.env.example` to `.env` and set
`VITE_DAILY_CAP_MINUTES` before building.

To build the reports from a folder of exports:

```bash
npm run report -- path/to/exports
```

`npm run power` shows how often the measurement detects a real effect at
each class size.

Checks, as CI runs them: `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`. `npm run decks:report` prints the deck statistics.

## Layout

| Folder                     | What it holds                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `scripts/`                 | The deck build (reads pinned OpenJLPT, writes `public/decks/<level>.json`), the report script and the power check |
| `scripts/report/`          | The reports: loading exports, the measurement, the class, ability and play reports                                |
| `src/deck/`                | Deck types, kana rules, decoy generators and kanji-reading combinations, shared by the script and the game        |
| `src/game/`                | Game rules in plain TypeScript with no Vue: dealing, taps, levels, score, tags, events, tuning                    |
| `src/kanji/`               | Kanji mode: its readings, dealing and scoring rounds, and the run that plays them                                 |
| `src/bank-run/`            | The bank run: the pot, wallet, rounds and shop, the items, and the crests on the cards                            |
| `src/memory/`              | The review engine, daily deck, learned difficulty, check-up, storage (IndexedDB) and export                       |
| `src/background/`          | The swirling table: a WebGL shader drawn behind the game                                                          |
| `src/composables/`         | `useRun` connects the rules to the clock, storage and screen; the rest deal, lay out and throw cards              |
| `src/components/`          | App-level screens: setup, check-up, mode picker, settings, stats, wellbeing, the table                            |
| `src/components/cards/`    | The card (front, back, frame, deck) and how it moves: dealing, tilting, throwing, dissolving                      |
| `src/components/words/`    | Word mode: its screen, board, side panel, missed tray and score                                                   |
| `src/components/kanji/`    | Kanji mode: its screen, board, result and scout panel                                                             |
| `src/components/bank-run/` | The bank run on screen: its panel, shop and end screen                                                            |
| `src/components/ui/`       | Shared pixel pieces: buttons, icons, the seal, stat panels, notices, the combo meter                              |
| `public/fonts/`            | The pixel font for English, with its licence (OFL); Japanese uses Kuronuri from npm                               |
| `public/sounds/`           | Card sounds from Kenney's Casino Audio pack (CC0, licence included)                                               |
| `public/_headers`          | Cloudflare Pages headers: the content security policy and caching                                                 |
| `tests/`                   | Vitest specs, one behaviour each                                                                                  |
| `docs/guide.md`            | How a request flows through the code, a glossary, and where to change things                                      |
| `docs/playtest.md`         | Deploying, watching learners play, tuning, and reading the reports                                                |
| `docs/spikes/`             | Spike reports                                                                                                     |

## Data and licences

Word data comes from [OpenJLPT](https://github.com/evanclan/OpenJLPT)
(CC BY-SA 4.0), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's
JLPT lists, and Tatoeba. The generated decks are CC BY-SA 4.0 too. The code
licence isn't chosen yet (decision D21).
