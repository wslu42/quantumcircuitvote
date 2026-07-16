import { layoutCircuit } from './layout'
import type { CircuitModel, CircuitOperation } from './types'
import './quantumVizAdapter.css'

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

function gateClass(operation: CircuitOperation): string {
  if (operation.type === 'single') return `composer-gate composer-${operation.gate}`
  if (operation.type === 'rotation') return `composer-gate composer-${operation.gate}`
  return 'composer-gate'
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
            return <g key={operation.id}><line x1={x} y1={y(operation.control)} x2={x} y2={y(operation.target)} className="composer-connection" /><circle cx={x} cy={y(operation.control)} r="7" className="composer-control" />{operation.gate === 'cx' ? <g><rect x={x - 29} y={y(operation.target) - 29} width="58" height="58" rx="3" className="composer-gate composer-x" /><circle cx={x} cy={y(operation.target)} r="16" className="composer-target" /><line x1={x - 11} y1={y(operation.target)} x2={x + 11} y2={y(operation.target)} className="composer-symbol" /><line x1={x} y1={y(operation.target) - 11} x2={x} y2={y(operation.target) + 11} className="composer-symbol" /></g> : <g><rect x={x - 29} y={y(operation.target) - 29} width="58" height="58" rx="3" className="composer-gate composer-z" /><text x={x} y={y(operation.target) + 7} className="composer-label">Z</text></g>}</g>
          }
          if (operation.type === 'swap') {
            return <g key={operation.id}><line x1={x} y1={y(operation.qubits[0])} x2={x} y2={y(operation.qubits[1])} className="composer-connection" />{operation.qubits.map((qubit) => <g key={qubit}><line x1={x - 11} y1={y(qubit) - 11} x2={x + 11} y2={y(qubit) + 11} className="composer-symbol" /><line x1={x + 11} y1={y(qubit) - 11} x2={x - 11} y2={y(qubit) + 11} className="composer-symbol" /></g>)}</g>
          }
          if (operation.type === 'barrier') {
            const qubits = operation.qubits === 'all' ? Array.from({ length: circuit.qubitCount }, (_, index) => index) : operation.qubits
            return <g key={operation.id}>{qubits.map((qubit) => <g key={qubit}><rect x={x - 6} y={y(qubit) - 29} width="12" height="58" className="composer-barrier-tile" /><line x1={x} y1={y(qubit) - 25} x2={x} y2={y(qubit) + 25} className="composer-barrier" /></g>)}</g>
          }
          const qubit = operation.type === 'measure' ? operation.qubit : operation.target
          if (operation.type === 'measure') return <g key={operation.id}><rect x={x - 29} y={y(qubit) - 29} width="58" height="58" rx="3" className="composer-measure" /><path d={`M ${x - 15} ${y(qubit) + 8} A 15 15 0 0 1 ${x + 15} ${y(qubit) + 8}`} className="composer-meter" /><line x1={x} y1={y(qubit) + 8} x2={x + 9} y2={y(qubit) - 8} className="composer-meter" /><text x={x + 18} y={y(qubit) - 12} className="composer-clbit">c{operation.clbit}</text></g>
          return <g key={operation.id}><rect x={x - 34} y={y(qubit) - 29} width="68" height="58" rx="3" className={gateClass(operation)} /><text x={x} y={y(qubit) + 7} className="composer-label">{label(operation)}</text></g>
        }))}
      </svg>
    </div>
  )
}
