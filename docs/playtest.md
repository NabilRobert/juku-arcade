# Playtest guide (slice 6)

How to put juku-arcade in front of a school, watch it being played,
tune it, and read what the data says. The plan is in
`docs/planning/slice-plan.md` (slice 6) and the measures are in
`docs/planning/phase-3-measurement-plan.md`.

## 1. Before: what the school needs to say

| Question | Why it matters |
|---|---|
| How many learners, and at which JLPT levels? | The headline needs **at least 8 learners** doing the check-up on most days for **14 days** (phase 3, slice 5b notes). Fewer than that and the report says "not enough data". |
| Are any of them under 18? | If so, set the daily play limit (W2, D19): `VITE_DAILY_CAP_MINUTES` in the deploy settings. |
| Who collects the export files, and how often? | Exports are the only way data leaves a browser (D18). Weekly works; the report drops duplicates, so sending a file twice is harmless. |
| A class code? | Optional (R9). Lets one report folder hold several classes and still tell them apart. |

## 2. Deploy (D20)

### The public demo: the owner's server, behind a password

The online demo runs on the owner's server behind Caddy, which asks for a
username and password before it sends any file (D76). The portfolio shows
both. Setting it up, updating it and changing the password:
[`ops/caddy-demo.md`](../ops/caddy-demo.md).

To update it, run `npm run demo:bundle` and swap the new bundle in on the
server. For a daily play limit, add it to that build:

```bash
VITE_DAILY_CAP_MINUTES=60 npm run demo:bundle
```

For a class, use Cloudflare Pages below: it gives every branch a preview.

### For a class: Cloudflare Pages

The repo is ready: `.node-version` pins Node 24 (Pages ignores
`engines` in package.json and would build with Node 22), and
`public/_headers` sets a strict content security policy and caching.

In the Cloudflare dashboard, **Workers & Pages → Create → Pages → Connect
to Git**, pick `NabilRobert/juku-arcade`, then:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable (only if minors play) | `VITE_DAILY_CAP_MINUTES` = the agreed minutes |

The build downloads the pinned OpenJLPT file and builds the decks itself,
so nothing else is needed. Every other branch gets its own preview URL:
use one to try a tuning change before it reaches the class.

**Check after the first deploy:** open the site on a laptop and on a
phone held upright, play a set, pause and flip a card, and use
**Settings → Export my data**. On Cloudflare, also run `curl -sI <site>`
and check the `content-security-policy` header is there.

## 3. During: watch two or three learners play

Sit next to them for 10 minutes each, without helping. Every number below
lives in `src/game/tuning.ts`.

| If you see… | It suggests | Change |
|---|---|---|
| Sets often run out of time at a level | That level's timer is too short | `SET_SECONDS_BY_LEVEL` |
| Learners waiting with nothing to do | The timer is too long | `SET_SECONDS_BY_LEVEL` |
| They never reach level 3 | Levels come too slowly | `COMBO_PER_LEVEL` |
| Groans or quitting after level 5 drops to 1 | The 5→1 rule is too harsh (D3) | A design call: the rule is a decision, not a number |
| They clear the daily deck in a couple of minutes | The deck is too small | `NEW_WORDS_PER_DAY` |
| They never clear it | The deck is too big | `NEW_WORDS_PER_DAY` |
| Tags all look the same | The tag steps are too close | `TAG_STEPS` |
| They can't read the answers after a timeout | The reveal is too short | `TIMED_OUT_PAUSE_MS` |

Also note: whether they find **Pause** and flip a card on their own,
whether they take the **daily check-up** or skip it, and anything they
say out loud. Write it down as you go, not afterwards.

A change goes on a branch, gets its preview URL, and reaches the class
when merged. Keep a note of each change and the day it went live, so the
data before and after can be told apart.

## 4. After: read the data

Put every export file in one folder, then:

```bash
npm run decks
npm run report -- path/to/exports
```

It writes five files to `report-output/`:

| File | Who it's for | What to look at first |
|---|---|---|
| `measurement-report.md` | The school's decision makers | The verdict: does play improve recall? |
| `play-report.md` | Whoever tunes the game | S6 check-up uptake (below 30%: tell the school early), then S4 |
| `class-report.md` | Teachers | Words to re-teach, common confusions |
| `ability-reports.md` | Teachers, per anonymous learner | Weak words and what they're misread as |
| `events.csv` | Anyone with a spreadsheet | Every event |

`npm run decks` comes first because the play report's S2 (daily deck
completion) and S3 (does the learned difficulty beat the starting guess?)
replay each learner's events against their deck.

**Read the first play report after one week**, mainly for S6: if fewer
than 30% of play days have a check-up, the headline will be thin by day
14, and the school should hear that while there's still time.

## 5. Then decide

After 14 days with the minimum data, slice 6 ends with a choice of
what comes next: grammar mode (D11), a small backend with an admin page
(D18), or moving to Juku's review engine API (R1).
