# Quantum Circuit Classroom

An English-language classroom MVP for learning quantum circuits through reading, reconstruction, and group evidence. Teachers describe a circuit with a safe Qiskit-like DSL. Students read a static text or graphic diagram, rebuild it manually in IBM Quantum Composer, run one shot, and report the observed classical result. Hosts see the distribution update through Firebase Realtime Database.

## Routes

Use a shared session query in the hash route:

- `#/author?session=DEMO` — author and publish a circuit.
- `#/student?session=DEMO` — read the circuit and report one shot.
- `#/host?session=DEMO` — open or close responses and view live counts.

## Circuit DSL

```python
qc.h(0)
qc.cx(0, 1)
qc.measure(0, 0)
qc.measure(1, 1)
```

Supported methods: `x`, `y`, `z`, `h`, `rx`, `ry`, `rz`, `cx`, `cz`, `swap`, `measure`, and `barrier`. Rotation angles are stored as text. This is not Python, does not install or execute Qiskit, and never evaluates the input.

Text view is the default mobile-friendly rendering. Graphic view is a lazy-loaded, read-only SVG renderer built on the same internal model. No circuit data is copied into IBM Composer; manual reconstruction is an intentional learning activity.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

The production build is written to `docs/` for GitHub Pages compatibility. Firebase configuration defaults to the legacy project and can be overridden with the variables in `.env.example`.

## Current limitations

- Author and host controls require Google sign-in as the configured teacher account. Google must be enabled in Firebase Authentication and the included Realtime Database rules must be published separately.
- One-response enforcement uses browser storage and is not identity-based.
- A session has one current experiment and one current round.
- Outcome controls are limited to 1–8 classical bits.
- The app does not simulate circuits or calculate ideal probabilities.
- The app does not inspect or verify the circuit a student creates in IBM Quantum Composer.

## Maintenance documentation

- [Architecture](documentation/ARCHITECTURE.md)
- [Circuit DSL](documentation/DSL.md)
- [Firebase model](documentation/FIREBASE.md)
- [Agent working notes](agent.md)

The next safe increment is Firebase Authentication or a host capability token, followed by per-student response records, predictions, observations, and ideal-distribution comparison.
