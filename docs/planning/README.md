# juku-arcade planning

An arcade card game for learning Japanese word readings, for Japanese
schools and their learners. These documents were written before the
build; later decisions are added to phase-5-decisions.md.

| Doc | What it holds |
|---|---|
| [phase-1-problem-brief.md](phase-1-problem-brief.md) | The problem, the core loop, the scope, and the open questions for the school |
| [phase-2-requirements-constraints.md](phase-2-requirements-constraints.md) | The loop's rules (L), review engine (R), check-up (C), data (D), wellbeing (W), barebones admin (A), and the non-functional requirements |
| [phase-3-measurement-plan.md](phase-3-measurement-plan.md) | The headline measure (does play improve recall?), fixed before code |
| [phase-5-decisions.md](phase-5-decisions.md) | Each decision with the options it beat, and what's reused |
| [slice-plan.md](slice-plan.md) | Slices 0–6, the merge order and the cut list |

## Status (2026-11-21)

- **Settled:** the core loop (D1–D10), grammar deferred
  (D11), the framework (D12), the measurement approach (D16, D17), the
  barebones admin (D18), and wellbeing (D19).
- **Added after review:** score versus ability (D25), detailed
  anonymous events (R6, D26), words known (R7), error types and the
  decoys that test them (R8, D27), class codes (R9), and the decision
  report (phase 3, D28).
- **Settled later the same day (all of the
  recommendations):** decoys that test error types (D27), hiding card
  faces while paused (D8), the Juku engine port (D13), storage (D14), the
  deck script (D15), hosting (D20), sound (D23), fonts (D24), and the
  licences (D21).
- **Kanji readings (D29):** one reading on each word card, and every
  kanji's readings on the card's back. A kanji-to-meaning mode is decided
  after the playtest.
- **Open:** the questions for a school in phase 1. Answers
  could change the deck levels, the minors cap, the UI language and slice
  6's timing.
