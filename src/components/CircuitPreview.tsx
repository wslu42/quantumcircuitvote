import { lazy, Suspense, useState } from 'react'
import type { CircuitModel } from '../circuit/types'
import { renderCircuitText } from '../circuit/textRenderer'

const GraphicCircuit = lazy(() => import('../circuit/quantumVizAdapter'))

export function CircuitPreview({ circuit }: { circuit: CircuitModel }) {
  // Text rendering remains available internally for a future accessibility or
  // instructor preference, but the classroom UI currently presents one
  // consistent Composer-style graphic view.
  const [mode] = useState<'text' | 'graphic'>('graphic')
  return <section className="preview panel" aria-label="Circuit preview">
    <div className="section-heading"><div><span className="eyebrow">Circuit preview</span><h2>Read left to right</h2></div></div>
    {mode === 'text' ? <pre className="circuit-text" aria-label="Text quantum circuit diagram">{renderCircuitText(circuit)}</pre> : <Suspense fallback={<p className="notice">Loading graphic view…</p>}><GraphicCircuit circuit={circuit} /></Suspense>}
  </section>
}
