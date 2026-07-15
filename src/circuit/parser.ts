import type { CircuitModel, CircuitOperation, CircuitParseError, CircuitParseResult } from './types'

const callPattern = /^qc\.([a-zA-Z_]\w*)\s*\((.*)\)\s*$/
const singles = new Set(['x', 'y', 'z', 'h'])
const rotations = new Set(['rx', 'ry', 'rz'])

function stripComment(line: string): string {
  return line.split('#', 1)[0].trim()
}

function indexArgument(value: string, label: string): number {
  if (!/^-?\d+(?:\.\d+)?$/.test(value.trim())) throw new Error(`${label} must be a non-negative integer.`)
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${label} must be a non-negative integer.`)
  return parsed
}

function argumentsFor(raw: string): string[] {
  if (!raw.trim()) return []
  return raw.split(',').map((argument) => argument.trim())
}

function requireCount(method: string, args: string[], count: number): void {
  if (args.length !== count) throw new Error(`qc.${method} expects ${count} argument${count === 1 ? '' : 's'}; received ${args.length}.`)
}

function parseOperation(method: string, args: string[], id: string): CircuitOperation {
  if (singles.has(method)) {
    requireCount(method, args, 1)
    return { id, type: 'single', gate: method as 'x' | 'y' | 'z' | 'h', target: indexArgument(args[0], 'Qubit index') }
  }
  if (rotations.has(method)) {
    requireCount(method, args, 2)
    if (!args[0]) throw new Error('Rotation angle cannot be empty.')
    return { id, type: 'rotation', gate: method as 'rx' | 'ry' | 'rz', angle: args[0], target: indexArgument(args[1], 'Qubit index') }
  }
  if (method === 'cx' || method === 'cz') {
    requireCount(method, args, 2)
    const control = indexArgument(args[0], 'Control qubit')
    const target = indexArgument(args[1], 'Target qubit')
    if (control === target) throw new Error(`qc.${method} requires different control and target qubits.`)
    return { id, type: 'controlled', gate: method, control, target }
  }
  if (method === 'swap') {
    requireCount(method, args, 2)
    const qubits: [number, number] = [indexArgument(args[0], 'First qubit'), indexArgument(args[1], 'Second qubit')]
    if (qubits[0] === qubits[1]) throw new Error('qc.swap requires two different qubits.')
    return { id, type: 'swap', qubits }
  }
  if (method === 'measure') {
    requireCount(method, args, 2)
    return { id, type: 'measure', qubit: indexArgument(args[0], 'Qubit index'), clbit: indexArgument(args[1], 'Classical bit index') }
  }
  if (method === 'barrier') {
    const qubits = args.length === 0 ? 'all' : args.map((argument) => indexArgument(argument, 'Barrier qubit'))
    if (qubits !== 'all' && new Set(qubits).size !== qubits.length) throw new Error('qc.barrier cannot repeat a qubit.')
    return { id, type: 'barrier', qubits }
  }
  throw new Error(`Unsupported method qc.${method}.`)
}

export function parseCircuitDsl(source: string): CircuitParseResult {
  const operations: CircuitOperation[] = []
  const errors: CircuitParseError[] = []
  source.split(/\r?\n/).forEach((original, index) => {
    const line = stripComment(original)
    if (!line) return
    const match = callPattern.exec(line)
    if (!match) {
      errors.push({ line: index + 1, column: 1, source: original, message: 'Expected a call such as qc.h(0).' })
      return
    }
    try {
      operations.push(parseOperation(match[1], argumentsFor(match[2]), `op-${index + 1}`))
    } catch (error) {
      errors.push({ line: index + 1, column: 1, source: original, message: error instanceof Error ? error.message : 'Invalid circuit instruction.' })
    }
  })
  if (errors.length) return { ok: false, errors }
  const qubitIndices = operations.flatMap((operation) => {
    if (operation.type === 'single' || operation.type === 'rotation') return [operation.target]
    if (operation.type === 'controlled') return [operation.control, operation.target]
    if (operation.type === 'swap') return operation.qubits
    if (operation.type === 'measure') return [operation.qubit]
    return operation.qubits === 'all' ? [] : operation.qubits
  })
  const clbitIndices = operations.flatMap((operation) => operation.type === 'measure' ? [operation.clbit] : [])
  const circuit: CircuitModel = {
    qubitCount: qubitIndices.length ? Math.max(...qubitIndices) + 1 : 0,
    clbitCount: clbitIndices.length ? Math.max(...clbitIndices) + 1 : 0,
    operations,
  }
  return { ok: true, circuit }
}
