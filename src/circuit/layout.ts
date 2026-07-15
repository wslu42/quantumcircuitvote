import { operationSpan, type CircuitModel, type CircuitOperation } from './types'

export type LayoutColumn = { index: number; operations: CircuitOperation[]; occupiedQubits: Set<number> }

export function layoutCircuit(circuit: CircuitModel): LayoutColumn[] {
  const columns: LayoutColumn[] = []
  const lastColumnByQubit = Array.from({ length: circuit.qubitCount }, () => -1)
  for (const operation of circuit.operations) {
    const occupied = operationSpan(operation, circuit.qubitCount)
    const columnIndex = Math.max(-1, ...occupied.map((qubit) => lastColumnByQubit[qubit])) + 1
    while (columns.length <= columnIndex) columns.push({ index: columns.length, operations: [], occupiedQubits: new Set() })
    const column = columns[columnIndex]
    column.operations.push(operation)
    occupied.forEach((qubit) => {
      column.occupiedQubits.add(qubit)
      lastColumnByQubit[qubit] = columnIndex
    })
  }
  return columns
}
