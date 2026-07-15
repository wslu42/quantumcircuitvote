import { parseCircuitDsl } from '../circuit/parser'
import type { ExpectedDistribution, LessonActivity, LessonDefinition } from './types'

const instructions = 'Rebuild this circuit in IBM Quantum Composer, run one shot, and report the bit string exactly as displayed.'

function activity(id: string, sectionId: string, order: number, title: string, shortTitle: string, circuitSource: string, expectedDistribution: ExpectedDistribution, conceptSummary: string[], reviewNotes?: string[]): LessonActivity {
  const parsed = parseCircuitDsl(circuitSource)
  if (!parsed.ok) throw new Error(`Built-in activity ${id} is invalid: ${parsed.errors.map((error) => error.message).join(', ')}`)
  return { id, sectionId, order, title, shortTitle, studentInstructions: instructions, circuitSource, circuit: parsed.circuit, expectedDistribution, conceptSummary, ...(reviewNotes ? { reviewNotes } : {}) }
}

const uniform = (bits: number): ExpectedDistribution => Object.fromEntries(Array.from({ length: 2 ** bits }, (_, value) => [value.toString(2).padStart(bits, '0'), 1 / (2 ** bits)]))

export const foundationsLesson: LessonDefinition = {
  id: 'quantum-circuit-foundations-v1',
  title: 'Quantum Circuit Foundations',
  description: 'From deterministic bits to quantum statistics, phase, and interference.',
  sections: [
    { id: 'section-a', title: 'From Bits to Quantum Statistics', order: 1 },
    { id: 'section-b', title: 'Gate Composition, Phase, and Interference', order: 2 },
  ],
  activities: [
    activity('a1', 'section-a', 1, 'Measure the Initial State', 'Initial state', `qc.measure(0, 0)`, { '0': 1, '1': 0 }, ['A qubit is initialized in |0⟩.', 'Ideally the outcome is always 0.', 'Real hardware may occasionally report 1 because of preparation or readout error.']),
    activity('a2', 'section-a', 2, 'Flip the Bit', 'Bit flip', `qc.x(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 0, '1': 1 }, ['X acts as a quantum NOT gate.', 'It maps |0⟩ to |1⟩.']),
    activity('a3', 'section-a', 3, 'One Quantum Coin', 'One coin', `qc.h(0)\nqc.barrier()\nqc.measure(0, 0)`, uniform(1), ['H|0⟩ = |+⟩.', 'One shot gives 0 or 1; the class reveals the equal distribution.']),
    activity('a4', 'section-a', 4, 'Two Independent Quantum Coins', 'Two coins', `qc.h(0)\nqc.h(1)\nqc.barrier()\nqc.measure(0, 0)\nqc.measure(1, 1)`, uniform(2), ['The state is a product state, not an entangled state.', 'Four bit strings are possible, each with ideal probability 1/4.']),
    activity('a5', 'section-a', 5, 'Three Independent Quantum Coins', 'Three coins', `qc.h(0)\nqc.h(1)\nqc.h(2)\nqc.barrier()\nqc.measure(0, 0)\nqc.measure(1, 1)\nqc.measure(2, 2)`, uniform(3), ['Three independent equal superpositions produce eight bit strings.', 'This demonstrates the 2^n growth of the outcome space.']),
    activity('b1', 'section-b', 6, 'One X Gate', 'One X', `qc.x(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 0, '1': 1 }, ['Verify X|0⟩ = |1⟩.', 'Connect the visual gate to the matrix action.']),
    activity('b2', 'section-b', 7, 'Two X Gates', 'X-X', `qc.x(0)\nqc.barrier()\nqc.x(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 1, '1': 0 }, ['X² = I.', 'Two flips restore the original state.']),
    activity('b3', 'section-b', 8, 'Two H Gates', 'H-H', `qc.h(0)\nqc.barrier()\nqc.h(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 1, '1': 0 }, ['H² = I.', 'The first H creates a superposition and the second recombines it into |0⟩.', 'This is an explicit interference example.']),
    activity('b4', 'section-b', 9, 'X Followed by H and H', 'X-H-H', `qc.x(0)\nqc.barrier()\nqc.h(0)\nqc.barrier()\nqc.h(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 0, '1': 1 }, ['The two H gates cancel as a pair.', 'The final result remains the state prepared by X.', 'Circuits execute left to right while matrices act right to left on kets.']),
    activity('b5', 'section-b', 10, 'Z on the Initial State', 'Invisible Z', `qc.z(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 1, '1': 0 }, ['Z|0⟩ = |0⟩.', 'Immediate computational-basis measurement does not reveal this phase action.', 'Z is still physically meaningful.']),
    activity('b6', 'section-b', 11, 'Reveal the Phase with H-Z-H', 'H-Z-H', `qc.h(0)\nqc.barrier()\nqc.z(0)\nqc.barrier()\nqc.h(0)\nqc.barrier()\nqc.measure(0, 0)`, { '0': 0, '1': 1 }, ['The first H changes basis.', 'Z changes relative phase.', 'The final H converts phase into a deterministic bit result: HZH = X.']),
  ],
}
