import { lazy, Suspense, useState } from 'react'
import type { CircuitModel } from '../circuit/types'
import { renderCircuitText } from '../circuit/textRenderer'

const GraphicCircuit = lazy(() => import('../circuit/quantumVizAdapter'))

export function CircuitPreview({ circuit }: { circuit: CircuitModel }) {
  const [mode, setMode] = useState<'text' | 'graphic'>('text')
  return <section className="preview panel" aria-label="Circuit preview">
    <div className="section-heading"><div><span className="eyebrow">Circuit preview</span><h2>Read left to right</h2></div><div className="segmented" aria-label="Preview mode"><button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>Text</button><button className={mode === 'graphic' ? 'active' : ''} onClick={() => setMode('graphic')}>Graphic</button></div></div>
    {mode === 'text' ? <pre className="circuit-text" aria-label="Text quantum circuit diagram">{renderCircuitText(circuit)}</pre> : <Suspense fallback={<p className="notice">Loading graphic view…</p>}><GraphicCircuit circuit={circuit} /></Suspense>}
  </section>
}
