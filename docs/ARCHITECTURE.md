# Architecture

## Data flow

1. The author enters a title, instructions, and Qiskit-like DSL.
2. The parser validates the DSL and creates a `CircuitModel`.
3. The layout engine assigns operations to conflict-free columns.
4. Text and graphic renderers consume the same model and layout.
5. Publishing writes the experiment and a new round to Firebase Realtime Database.
6. Student clients subscribe to the session, render the circuit, and submit outcomes.
7. Host clients subscribe to aggregate counts and render a live distribution.

## Modules

- `src/circuit`: domain types, parser, scheduling, renderers, and examples.
- `src/firebase`: Firebase initialization and the session repository.
- `src/components`: reusable presentation and interaction components.
- `src/pages`: author, student, and host workflows.

## Rendering strategy

Text view is the default and has no visualization dependency. Graphic view is lazy-loaded. Its adapter owns all renderer-specific conversion so the domain model remains stable.

## Deployment

Vite builds to `docs/` for compatibility with the repository's existing GitHub Pages configuration. Hash routes avoid server rewrite requirements.
