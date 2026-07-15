# Quantum Circuit Classroom

An English-language classroom lesson for learning quantum circuits through manual reconstruction and group evidence. The built-in **Quantum Circuit Foundations** sequence contains eleven ordered activities spanning initialization, deterministic gates, product-state statistics, composition, phase, and interference.

Each student reads a static Text or Graphic circuit, rebuilds it in a blank IBM Quantum Composer, runs one shot, and reports the displayed classical bit string. Individual shots can be random; the class distribution exposes the quantum rule. After responses close, the instructor reveals the stored theoretical distribution and concept summary.

## Primary workflow

1. Open `#/author?session=DEMO`, sign in as the configured teacher, and load the Foundations lesson.
2. Share `#/student?session=DEMO` with students.
3. Move through the ordered activities, opening and closing one response round per activity.
4. Reveal observed-versus-expected results, repeat activities as new rounds, or review preserved prior rounds.
5. Optionally collect a short post-reveal reflection.

The legacy `#/host` hash also opens the merged Instructor experience. The first activity is direct measurement of the initialized `|0⟩` state; Bell and arbitrary-circuit authoring are not part of this lesson.

## Circuit model and rendering

The lesson template is validated data built from the safe Qiskit-like DSL. Supported methods remain `x`, `y`, `z`, `h`, `rx`, `ry`, `rz`, `cx`, `cz`, `swap`, `measure`, and `barrier`. The parser never evaluates Python. `CircuitModel` remains the source of truth for the compact text renderer and lazy read-only SVG renderer.

No circuit is copied into IBM Composer. OpenQASM, automatic import, simulation, drag-and-drop editing, and student circuit verification are intentionally absent.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

Vite writes the production build to `docs/` for GitHub Pages. Firebase configuration can be overridden with `.env.example`.

## Current limitations

- Instructor controls require Google sign-in as `wslu42@gmail.com`; the Firebase provider, authorized domain, and Realtime Database rules must be deployed separately.
- Students are anonymous. One-response enforcement uses browser storage and is not an identity or security boundary.
- Expected distributions are curriculum data, not simulator output.
- The app does not identify the cause of hardware deviations or inspect a student's Composer circuit.
- The built-in lesson covers product states and interference; Bell-state curriculum is a future lesson.

## Documentation

- [Foundations lesson](documentation/FOUNDATIONS_LESSON.md)
- [Architecture](documentation/ARCHITECTURE.md)
- [Firebase model and migration](documentation/FIREBASE.md)
- [Circuit DSL](documentation/DSL.md)
- [Agent working notes](agent.md)
