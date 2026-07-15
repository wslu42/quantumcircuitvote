import { describe, expect, it } from 'vitest'
import { layoutCircuit } from './layout'
import { parseCircuitDsl } from './parser'
import { renderCircuitText } from './textRenderer'

function parse(source: string) {
  const result = parseCircuitDsl(source)
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('parse failed')
  return result.circuit
}

describe('parseCircuitDsl', () => {
  it('parses supported operations and infers register sizes', () => {
    const circuit = parse(`qc.x(0)\nqc.y(1)\nqc.z(2)\nqc.h(3)\nqc.rx(pi/2, 0)\nqc.ry(-pi/4, 1)\nqc.rz(theta, 2)\nqc.cx(0, 3)\nqc.cz(1, 2)\nqc.swap(0, 2)\nqc.measure(3, 4)`)
    expect(circuit.operations).toHaveLength(11)
    expect(circuit.qubitCount).toBe(4)
    expect(circuit.clbitCount).toBe(5)
    expect(circuit.operations[4]).toMatchObject({ type: 'rotation', angle: 'pi/2' })
  })

  it('supports all and selected barriers, blank lines, and comments', () => {
    const circuit = parse(`# start\nqc.h(0) # inline\n\nqc.barrier()\nqc.barrier(0, 2)`)
    expect(circuit.operations.slice(1)).toEqual([
      { id: 'op-4', type: 'barrier', qubits: 'all' },
      { id: 'op-5', type: 'barrier', qubits: [0, 2] },
    ])
    expect(circuit.qubitCount).toBe(3)
  })

  it.each([
    ['qc.s(0)', 'Unsupported method'],
    ['qc.h()', 'expects 1 argument'],
    ['qc.h(-1)', 'non-negative integer'],
    ['qc.h(1.5)', 'non-negative integer'],
    ['qc.cx(1, 1)', 'different control'],
    ['qc.cz(1, 1)', 'different control'],
    ['qc.swap(2, 2)', 'two different'],
    ['qc.measure(0)', 'expects 2 arguments'],
    ['for x in q:', 'Expected a call'],
  ])('rejects %s', (source, message) => {
    const result = parseCircuitDsl(source)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].message).toContain(message)
  })
})

describe('layout and text rendering', () => {
  it('renders a Bell circuit with controls, targets, and measurements', () => {
    const output = renderCircuitText(parse(`qc.h(0)\nqc.cx(0, 1)\nqc.measure(0, 0)\nqc.measure(1, 1)`))
    expect(output).toContain('[H]')
    expect(output).toContain('●')
    expect(output).toContain('⊕')
    expect(output).toContain('[M→c0]')
    expect(output).toContain('[M→c1]')
  })

  it('does not schedule an operation into a multi-qubit span conflict', () => {
    const columns = layoutCircuit(parse(`qc.cx(0, 2)\nqc.h(1)`))
    expect(columns).toHaveLength(2)
    expect(columns[0].operations[0].type).toBe('controlled')
    expect(columns[1].operations[0].type).toBe('single')
  })
})
