# Architecture

## Lesson data flow

1. `foundationsLesson.ts` defines two sections and eleven ordered activities as data.
2. Each activity's DSL is parsed at module initialization into the canonical `CircuitModel`.
3. Lesson validation checks unique IDs/order, output widths, and probability sums.
4. An authenticated instructor initializes a non-destructive session, creating the first draft round for A1.
5. The instructor selects activities or repeats one; each selection creates a new round while prior rounds remain addressable.
6. Students subscribe to the active activity and round, manually reconstruct the static circuit, and transact one outcome only while the active round is open.
7. Closing stops submissions. Revealing exposes observed counts, expected percentages, deviation, concept summaries, and optional reflection.

## Modules

- `src/circuit`: whitelist parser, canonical circuit types, scheduling, outcomes, and text/SVG rendering adapters.
- `src/lessons`: lesson/activity/round types, built-in Foundations data, progression, validation, reflection, and review calculations.
- `src/firebase`: Firebase initialization, legacy repository, and the lesson repository with preserved rounds.
- `src/components`: circuit preview, outcome controls, teacher authentication, and observed-versus-expected comparison.
- `src/pages`: merged Instructor workflow and Student workflow. Legacy `author` and `host` hashes both resolve to Instructor.

## State machine

```text
draft → open → closed → revealed
```

An instructor may reveal a draft/closed round, reopen when appropriate, or repeat the activity as a distinct draft round. Student submissions require both `lesson.activeRoundId` equality and `round.status === open`. Expected data and concepts render only for `revealed` rounds.

## Rendering and deployment

Text remains the default dependency-free view. Graphic rendering is lazy and read-only. Both consume the same `CircuitModel`; expected distributions never come from a simulator.

Hash routing avoids server rewrites on GitHub Pages. Vite builds generated assets into `docs/`; maintainable documentation remains in `documentation/`.
