import { layoutCircuit } from './layout'
import type { CircuitModel, CircuitOperation } from './types'

function marker(operation: CircuitOperation, qubit: number): string {
  if (operation.type === 'single' && operation.target === qubit) return `[${operation.gate.toUpperCase()}]`
  if (operation.type === 'rotation' && operation.target === qubit) return `[${operation.gate.toUpperCase()}(${operation.angle.replaceAll('pi', 'π')})]`
  if (operation.type === 'measure' && operation.qubit === qubit) return `[M→c${operation.clbit}]`
  if (operation.type === 'controlled') {
    if (operation.control === qubit) return '●'
    if (operation.target === qubit) return operation.gate === 'cx' ? '⊕' : '●Z'
  }
  if (operation.type === 'swap' && operation.qubits.includes(qubit)) return '×'
  if (operation.type === 'barrier' && (operation.qubits === 'all' || operation.qubits.includes(qubit))) return '│B│'
  return ''
}

export function renderCircuitText(circuit: CircuitModel): string {
  if (!circuit.qubitCount) return 'No qubit operations yet.'
  const columns = layoutCircuit(circuit)
  const widths = columns.map((column) => Math.max(5, ...column.operations.flatMap((operation) => Array.from({ length: circuit.qubitCount }, (_, q) => marker(operation, q).length + 2))))
  const wireRows = Array.from({ length: circuit.qubitCount }, (_, qubit) => `q${qubit} `)
  const connectorRows = Array.from({ length: Math.max(0, circuit.qubitCount - 1) }, () => '   ')
  columns.forEach((column, columnIndex) => {
    const width = widths[columnIndex]
    const fill = (value: string, wire = false) => {
      const remaining = width - value.length
      const left = Math.floor(remaining / 2)
      return `${wire ? '─'.repeat(left) : ' '.repeat(left)}${value}${wire ? '─'.repeat(remaining - left) : ' '.repeat(remaining - left)}`
    }
    for (let qubit = 0; qubit < circuit.qubitCount; qubit += 1) {
      const operation = column.operations.find((candidate) => marker(candidate, qubit))
      wireRows[qubit] += fill(operation ? marker(operation, qubit) : '', true)
    }
    for (let gap = 0; gap < connectorRows.length; gap += 1) {
      const connected = column.operations.some((operation) => {
        if (operation.type === 'controlled') return gap >= Math.min(operation.control, operation.target) && gap < Math.max(operation.control, operation.target)
        if (operation.type === 'swap') return gap >= Math.min(...operation.qubits) && gap < Math.max(...operation.qubits)
        if (operation.type === 'barrier') {
          const qs = operation.qubits === 'all' ? Array.from({ length: circuit.qubitCount }, (_, i) => i) : operation.qubits
          return qs.includes(gap) && qs.includes(gap + 1)
        }
        return false
      })
      connectorRows[gap] += fill(connected ? '│' : '')
    }
  })
  return wireRows.flatMap((row, index) => index < connectorRows.length ? [row, connectorRows[index]] : [row]).join('\n')
}
