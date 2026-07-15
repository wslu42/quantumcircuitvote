import { useMemo, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { circuitExamples } from '../circuit/examples'
import { parseCircuitDsl } from '../circuit/parser'
import { publishExperiment } from '../firebase/sessionRepository'

export function AuthorPage({ sessionId }: { sessionId: string }) {
  const [title, setTitle] = useState('Bell state classroom experiment')
  const [instructions, setInstructions] = useState('Rebuild this circuit in IBM Quantum Composer, run one shot, then report the result.')
  const [source, setSource] = useState<string>(circuitExamples.Bell)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const parsed = useMemo(() => parseCircuitDsl(source), [source])

  async function publish() {
    if (!parsed.ok || !title.trim()) return
    setBusy(true); setMessage('')
    try {
      await publishExperiment(sessionId, { title: title.trim(), instructions: instructions.trim(), circuitSource: source, circuit: parsed.circuit })
      setMessage(`Published to session ${sessionId}. Open the host page to start responses.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Publishing failed.') }
    finally { setBusy(false) }
  }

  return <main className="page-grid"><section className="panel editor-panel"><span className="eyebrow">Teacher authoring · {sessionId}</span><h1>Build a classroom circuit</h1><p className="lede">Write a small Qiskit-like description. It is parsed as text and never executes Python.</p><label>Experiment title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Student instructions<textarea className="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} /></label><label>Circuit DSL<textarea className="dsl-editor" spellCheck={false} value={source} onChange={(event) => setSource(event.target.value)} /></label><div className="example-row">{Object.entries(circuitExamples).map(([name, example]) => <button className="secondary" key={name} onClick={() => setSource(example)}>{name}</button>)}</div>{parsed.ok ? <div className="notice success">Valid circuit · {parsed.circuit.qubitCount} qubits · {parsed.circuit.clbitCount} classical bits</div> : <div className="error-list" role="alert">{parsed.errors.map((error) => <p key={`${error.line}-${error.message}`}><strong>Line {error.line}:</strong> {error.message}</p>)}</div>}<div className="actions"><button className="primary" disabled={!parsed.ok || !title.trim() || busy} onClick={publish}>{busy ? 'Publishing…' : 'Publish experiment'}</button><button className="secondary" onClick={() => { setSource(circuitExamples.Bell); setMessage('') }}>Reset example</button></div>{message && <p className="notice">{message}</p>}<details><summary>Supported syntax</summary><code>x, y, z, h · rx, ry, rz · cx, cz, swap · measure, barrier</code></details></section>{parsed.ok ? <CircuitPreview circuit={parsed.circuit} /> : <section className="panel preview empty"><h2>Preview paused</h2><p>Fix the highlighted DSL errors to render the circuit.</p></section>}</main>
}
