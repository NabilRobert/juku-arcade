# juku-arcade planning

An arcade card game for learning Japanese word readings, for a friend's
Japanese school. These documents are planning only: there's no code yet.

| Doc | What it holds |
|---|---|
| [phase-1-problem-brief.md](phase-1-problem-brief.md) | The problem, the core loop, the scope, and the open questions for the school |
| [phase-2-requirements-constraints.md](phase-2-requirements-constraints.md) | The loop's rules (L), review engine (R), check-up (C), data (D), wellbeing (W), barebones admin (A), and the non-functional requirements |
| [phase-3-measurement-plan.md](phase-3-measurement-plan.md) | The headline measure (does play improve recall?), fixed before code |
| [phase-5-decisions.md](phase-5-decisions.md) | Each decision with the options it beat, and what's reused |
| [slice-plan.md](slice-plan.md) | Slices 0–6, the merge order and the cut list |

## Status (2026-11-21)

- **Settled with Arthur:** the core loop (D1–D10), grammar deferred
  (D11), the framework (D12), the measurement approach (D16, D17), the
  barebones admin (D18), and wellbeing (D19).
- **Added after Arthur's review:** score versus ability (D25), detailed
  anonymous events (R6, D26), words known (R7), error types and the
  decoys that test them (R8, D27), class codes (R9), and the decision
  report (phase 3, D28).
- **Waiting on Arthur:** decoys that test error types (D27), hiding card faces while paused (D8), the Juku
  engine port (D13), storage (D14), the deck script (D15), hosting (D20),
  and the code licence (D21).
- **Waiting on the school:** the open questions in phase 1. Answers
  could change the deck levels, the minors cap, the UI language and slice
  6's timing.
