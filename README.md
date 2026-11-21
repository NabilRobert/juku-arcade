# juku-arcade

An arcade card game for learning the readings of Japanese words. Match 5
kanji word cards (学校) to their readings (がっこう), with a decoy in the
mix. Combos raise the level, and each level gives less time. There's no
game over.

Built for a friend's Japanese school, as a static web app with no server.
The plan, with its measurement plan, decisions and slices, is in
[`docs/planning/`](docs/planning/).

**Status:** slice 4. The game is playable and remembers your progress, in
a karuta table look: washi-paper cards with a vermilion stamp for each
card's difficulty, a side panel with a counting-up score, and animation
that follows your reduce-motion setting. It suggests a break after 15
minutes, and schools can set a daily cap. The check-up and export come in
slice 5.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` first builds the word decks. On the first run it downloads
the pinned OpenJLPT file (about 6 MB) into `data/raw/`.

For schools where minors play, copy `.env.example` to `.env` and set
`VITE_DAILY_CAP_MINUTES` before building.

Checks, as CI runs them: `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`. `npm run decks:report` prints the deck statistics.

## Layout

| Folder            | What it holds                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `scripts/`        | The deck build: reads pinned OpenJLPT and writes `public/decks/<level>.json`                               |
| `src/deck/`       | Deck types, kana rules, decoy generators and kanji-reading combinations, shared by the script and the game |
| `src/game/`       | Game rules in plain TypeScript with no Vue (dealing a set for now)                                         |
| `src/components/` | Vue components: the board, the card, the "About the data" page                                             |
| `tests/`          | Vitest specs, one behaviour each                                                                           |
| `docs/guide.md`   | How a request flows through the code, a glossary, and where to change things                               |
| `docs/spikes/`    | Spike reports                                                                                              |

## Data and licences

Word data comes from [OpenJLPT](https://github.com/evanclan/OpenJLPT)
(CC BY-SA 4.0), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's
JLPT lists, and Tatoeba. The generated decks are CC BY-SA 4.0 too. The code
licence will be added once ownership is confirmed (decision D21).
