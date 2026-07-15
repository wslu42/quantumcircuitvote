export type SingleGate = 'x' | 'y' | 'z' | 'h'
export type RotationGate = 'rx' | 'ry' | 'rz'

export type CircuitOperation =
  | { id: string; type: 'single'; gate: SingleGate; target: number }
  | { id: string; type: 'rotation'; gate: RotationGate; angle: string; target: number }
  | { id: string; type: 'controlled'; gate: 'cx' | 'cz'; control: number; target: number }
  | { id: string; type: 'swap'; qubits: [number, number] }
  | { id: string; type: 'measure'; qubit: number; clbit: number }
  | { id: string; type: 'barrier'; qubits: number[] | 'all' }

export type CircuitModel = { qubitCount: number; clbitCount: number; operations: CircuitOperation[] }
export type CircuitParseError = { line: number; column?: number; source: string; message: string }
export type CircuitParseResult = { ok: true; circuit: CircuitModel } | { ok: false; errors: CircuitParseError[] }

export function operationSpan(operation: CircuitOperation, qubitCount: number): number[] {
  if (operation.type === 'single' || operation.type === 'rotation') return [operation.target]
  if (operation.type === 'measure') return [operation.qubit]
  if (operation.type === 'barrier') return operation.qubits === 'all' ? Array.from({ length: qubitCount }, (_, index) => index) : operation.qubits
  const [low, high] = operation.type === 'controlled'
    ? [Math.min(operation.control, operation.target), Math.max(operation.control, operation.target)]
    : [Math.min(...operation.qubits), Math.max(...operation.qubits)]
  return Array.from({ length: high - low + 1 }, (_, index) => low + index)
}
