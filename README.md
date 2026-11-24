# juku-arcade

An arcade card game for learning the readings of Japanese words, built for
Japanese learners. Match 5 kanji word cards (学校) to their readings
(がっこう), with a decoy in the mix; combos raise the level and fill a pot
you can bank or lose. A second mode asks for every reading of one kanji,
and a third, Bunpou, has you put grammar tiles in order to build a short
generated tale.
It's a static web app with no server: progress stays in the browser.

**Play it:** <https://nabilrobert.github.io/juku-arcade/> (on a laptop or
desktop; the layout isn't made for phones yet).

An optional daily check-up is designed to measure whether playing improves
recall. No learners have been measured yet, so there's no result to report.

## Run it

```bash
npm install && npm run dev
```

The first run downloads the pinned OpenJLPT file (about 6 MB) and builds
the word decks.

Checks, as CI runs them: `npm run lint`, `npm run typecheck`, `npm test`,
`npm run build`. Every push to `main` that passes them deploys to GitHub
Pages (`.github/workflows/deploy.yml`).

## Layout

| Folder     | What it holds                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`     | The game: rules in plain TypeScript (`game/`, `kanji/`, `bank-run/`, `memory/`, `grammar/`, `preferences/`), screens in `components/` |
| `scripts/` | The deck and font builds, and the reports made from exported play data                                                                |
| `public/`  | Fonts, card sounds, music and hosting headers                                                                                         |
| `tests/`   | Vitest specs, one behaviour each                                                                                                      |
| `docs/`    | The guides and planning documents below                                                                                               |

## Read more

- [`docs/guide.md`](docs/guide.md): how a request flows through the code, a
  glossary, and where to change things.
- [`docs/playtest.md`](docs/playtest.md): deploying, running a playtest, and
  building the reports.
- [`docs/planning/`](docs/planning/): the requirements, measurement plan and
  decisions.

## Data and licences

Word data comes from [OpenJLPT](https://github.com/evanclan/OpenJLPT)
(CC BY-SA 4.0), which uses JMdict and KANJIDIC2 (EDRDG), Jonathan Waller's
JLPT lists, and Tatoeba; the generated decks are CC BY-SA 4.0 too. The
fonts are balatro and Kuronuri (both OFL), and the card sounds are from
Kenney's Casino Audio pack (CC0). The music is "France Instrumental" by
Sub_Clair, from [Pixabay](https://pixabay.com/music/france-france-instrumental-633138/)
(Pixabay Content License). No licence yet for the code.
