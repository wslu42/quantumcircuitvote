import { useState } from 'react'
import './BlochSimulator.css'

const simulatorUrl = 'https://wslu42.github.io/blochsim/'

export function BlochSimulator({ audience }: { audience: 'student' | 'instructor' }) {
  const [expanded, setExpanded] = useState(false)
  const purpose = audience === 'student'
    ? 'Try single-qubit gates on the Bloch sphere while you reconstruct and reason about the activity.'
    : 'Use the Bloch sphere to demonstrate how single-qubit gates move and phase the state.'

  return <section className="panel bloch-panel"><div className="bloch-heading"><div><span className="eyebrow">Single-qubit gate sandbox</span><h2>Bloch sphere simulator</h2><p>{purpose}</p></div><button className={expanded ? 'secondary' : 'primary'} onClick={() => setExpanded((value) => !value)}>{expanded ? 'Hide simulator' : 'Open simulator'}</button></div>
    {expanded && <div className="bloch-frame-wrap"><iframe src={simulatorUrl} title="Interactive Bloch sphere simulator" className="bloch-frame" loading="lazy" /><p className="bloch-help">If the embedded simulator is too small on your device, <a href={simulatorUrl} target="_blank" rel="noreferrer">open BlochSim in a new tab ↗</a>.</p></div>}
  </section>
}
