import { layoutCircuit } from './layout'
import type { CircuitModel, CircuitOperation } from './types'

const columnWidth = 112
const wireGap = 76
const left = 64
const top = 48

function label(operation: CircuitOperation): string {
  if (operation.type === 'single') return operation.gate.toUpperCase()
  if (operation.type === 'rotation') return `${operation.gate.toUpperCase()}(${operation.angle.replaceAll('pi', 'π')})`
  if (operation.type === 'measure') return `M → c${operation.clbit}`
  return ''
}

export default function QuantumVizAdapter({ circuit }: { circuit: CircuitModel }) {
  const columns = layoutCircuit(circuit)
  const width = Math.max(360, left * 2 + columns.length * columnWidth)
  const height = Math.max(140, top * 2 + (circuit.qubitCount - 1) * wireGap)
  const y = (qubit: number) => top + qubit * wireGap

  return (
    <div className="graphic-scroll" role="img" aria-label="Graphical quantum circuit diagram">
      <svg viewBox={`0 0 ${width} ${height}`} className="circuit-svg">
        {Array.from({ length: circuit.qubitCount }, (_, qubit) => (
          <g key={qubit}>
            <text x="8" y={y(qubit) + 5} className="wire-label">q{qubit}</text>
            <line x1={left - 12} y1={y(qubit)} x2={width - 24} y2={y(qubit)} className="wire" />
          </g>
        ))}
        {columns.flatMap((column) => column.operations.map((operation) => {
          const x = left + column.index * columnWidth + columnWidth / 2
          if (operation.type === 'controlled') {
            return <g key={operation.id}><line x1={x} y1={y(operation.control)} x2={x} y2={y(operation.target)} className="connection" /><circle cx={x} cy={y(operation.control)} r="7" className="control" />{operation.gate === 'cx' ? <g><circle cx={x} cy={y(operation.target)} r="16" className="target" /><line x1={x - 10} y1={y(operation.target)} x2={x + 10} y2={y(operation.target)} className="connection" /><line x1={x} y1={y(operation.target) - 10} x2={x} y2={y(operation.target) + 10} className="connection" /></g> : <g><rect x={x - 20} y={y(operation.target) - 20} width="40" height="40" rx="7" className="gate" /><text x={x} y={y(operation.target) + 5} className="gate-label">Z</text></g>}</g>
          }
          if (operation.type === 'swap') {
            return <g key={operation.id}><line x1={x} y1={y(operation.qubits[0])} x2={x} y2={y(operation.qubits[1])} className="connection" />{operation.qubits.map((qubit) => <g key={qubit}><line x1={x - 10} y1={y(qubit) - 10} x2={x + 10} y2={y(qubit) + 10} className="connection" /><line x1={x + 10} y1={y(qubit) - 10} x2={x - 10} y2={y(qubit) + 10} className="connection" /></g>)}</g>
          }
          if (operation.type === 'barrier') {
            const qubits = operation.qubits === 'all' ? Array.from({ length: circuit.qubitCount }, (_, index) => index) : operation.qubits
            return <g key={operation.id}>{qubits.map((qubit) => <line key={qubit} x1={x} y1={y(qubit) - 24} x2={x} y2={y(qubit) + 24} className="barrier" />)}</g>
          }
          const qubit = operation.type === 'measure' ? operation.qubit : operation.target
          return <g key={operation.id}><rect x={x - 38} y={y(qubit) - 22} width="76" height="44" rx="8" className={operation.type === 'measure' ? 'measure-gate' : 'gate'} /><text x={x} y={y(qubit) + 5} className="gate-label">{label(operation)}</text></g>
        }))}
      </svg>
    </div>
  )
}
