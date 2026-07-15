# Agent Working Notes

## Mission

Replace the legacy single-file H/Bell voting proof of concept with an English-language Vite, React, and TypeScript classroom MVP. Teachers author read-only circuits using a small Qiskit-like DSL; students reconstruct those circuits in IBM Quantum Composer and report one observed classical result; hosts see live aggregate results.

## Authoritative scope

The requested plan was referenced as `/mnt/data/quantumcircuitvote_codex_implementation_plan.md`, but that file is not available in this Windows workspace. The detailed requirements preserved in the referenced conversation are being treated as the authoritative specification.

## Required workflow

- Preserve the legacy baseline with tag `legacy-h-bell-v1` when practical.
- Develop on `feat/circuit-classroom-mvp`.
- Keep the public interface in English.
- Make focused, meaningful commits.
- Keep architecture and maintenance documentation current.
- Run typecheck, lint, tests, and a production build before handoff.

## MVP boundaries

Supported DSL methods: `x`, `y`, `z`, `h`, `rx`, `ry`, `rz`, `cx`, `cz`, `swap`, `measure`, and `barrier`.

The application must not execute Python and must not expose OpenQASM, circuit copy/import, drag-and-drop editing, quantum simulation, authentication, predictions, observations, or multi-experiment libraries in this MVP.

## Architecture rules

- Circuit parsing, layout, text rendering, graphical adaptation, Firebase access, and React UI remain separate.
- The internal `CircuitModel` is the source of truth; renderer-specific schemas stay behind adapters.
- Firebase session paths are validated before use.
- Student submission is one per browser per round unless the host enables multiple responses.
- The graphical renderer is lazy-loaded and failure must not break the text renderer.

## Maintenance log

- 2026-07-15: Legacy baseline tagged at `863b900`; feature work started.
- 2026-07-15: Added the strict DSL parser, conflict-free layout engine, compact text renderer, and core tests.
- 2026-07-15: Added the English author, student, and host flows; Firebase session repository; lazy SVG graphic renderer; live outcome controls and histogram.
- 2026-07-15: Chose a 2.3 kB lazy SVG adapter instead of `@microsoft/quantum-viz.js` because the required gate set is small and the third-party package has an older imperative API. The adapter boundary permits replacement later.
- 2026-07-15: Moved source documentation to `documentation/`; Vite owns and replaces `docs/` as generated GitHub Pages output.
