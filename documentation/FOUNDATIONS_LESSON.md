# Quantum Circuit Foundations

## Pedagogical rationale

Each student contributes one classical measurement outcome. A single outcome may be random, while the class distribution reveals a precise quantum rule. Students manually reconstruct every static circuit in IBM Quantum Composer so that reading and building the circuit remains part of the learning activity.

The lesson moves from initialization and deterministic bit flips through single- and multi-qubit product-state statistics, then uses gate cancellation, phase, and basis change to make interference visible. Expected distributions remain hidden while responses are open and become discussion material only after reveal.

## Ordered activities

### Section A — From Bits to Quantum Statistics

1. **A1 — Measure the Initial State:** `measure(0, 0)`; expected `0: 100%`, `1: 0%`. Establish ideal initialization in `|0⟩` and introduce preparation/readout error.
2. **A2 — Flip the Bit:** `X`, barrier, measure; expected `0: 0%`, `1: 100%`. Connect X with quantum NOT.
3. **A3 — One Quantum Coin:** `H`, barrier, measure; expected `0: 50%`, `1: 50%`. Contrast an individual random shot with a stable class distribution.
4. **A4 — Two Independent Quantum Coins:** H on two qubits, barrier, measure both; expected `00`, `01`, `10`, and `11` at 25% each. This is a product state, not entanglement: both qubits are prepared independently.
5. **A5 — Three Independent Quantum Coins:** H on three qubits, barrier, measure all; all eight three-bit strings at 12.5%. Discuss the `2^n` growth of the outcome space.

### Section B — Gate Composition, Phase, and Interference

6. **B1 — One X Gate:** X, barrier, measure; expected `1: 100%`. Connect the visual gate with its matrix action.
7. **B2 — Two X Gates:** X, barrier, X, barrier, measure; expected `0: 100%`. Two bit flips compose to identity.
8. **B3 — Two H Gates:** H, barrier, H, barrier, measure; expected `0: 100%`. The second H recombines the superposition; this is the first explicit interference example.
9. **B4 — X Followed by H and H:** X, barrier, H, barrier, H, barrier, measure; expected `1: 100%`. Reinforce left-to-right circuit execution and cancellation of the H pair.
10. **B5 — Z on the Initial State:** Z, barrier, measure; expected `0: 100%`. Since `Z|0⟩ = |0⟩`, immediate computational-basis measurement cannot reveal the phase action.
11. **B6 — Reveal the Phase with H-Z-H:** H, barrier, Z, barrier, H, barrier, measure; expected `1: 100%`. The first H changes basis, Z changes relative phase, and the final H converts phase into a deterministic bit result: `HZH = X`.

## Discussion and imperfect hardware results

For deterministic activities, compare the expected outcome, observed success rate, and unexpected-outcome count. Deviations can motivate discussion of preparation, gate, and readout error without asserting a unique cause. For uniform activities, compare every observed bar with its 50%, 25%, or 12.5% target and discuss finite-sample variation.

A4 and A5 deliberately use independent H gates only. Their state factors into single-qubit `|+⟩` states, so the expanded outcome space is not evidence of entanglement.

## Bit-string convention

Students report the bit string exactly as IBM Quantum Composer displays it. Expected-distribution keys, outcome buttons, stored counts, and charts use that same display order and never silently reverse a result. In Qiskit-style notation, displayed classical strings conventionally place the highest-index classical bit at the left; the application asks students to transcribe rather than reinterpret the displayed result.
