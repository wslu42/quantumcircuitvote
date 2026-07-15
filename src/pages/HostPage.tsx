import { useEffect, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { ResultHistogram } from '../components/ResultHistogram'
import { resetCounts, subscribeSession, updateRound, type ClassroomSession, type RoundStatus } from '../firebase/sessionRepository'

export function HostPage({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ClassroomSession>({ experiment: null, round: null, counts: {} })
  const [message, setMessage] = useState('')
  useEffect(() => subscribeSession(sessionId, setSession), [sessionId])
  async function setStatus(status: RoundStatus) { try { await updateRound(sessionId, { status }); setMessage(`Responses are ${status}.`) } catch { setMessage('Could not update the round.') } }
  if (!session.experiment || !session.round) return <main className="single-column"><section className="panel empty"><span className="eyebrow">Host · {sessionId}</span><h1>No published experiment</h1><p>Use the Author page to publish a circuit to this session.</p></section></main>
  return <main className="single-column"><section className="hero"><span className="eyebrow">Host controls · {sessionId}</span><h1>{session.experiment.title}</h1><div className="host-controls"><button className="primary" onClick={() => setStatus('open')}>Open responses</button><button className="secondary" onClick={() => setStatus('closed')}>Close responses</button><button className="secondary" onClick={() => resetCounts(sessionId)}>Reset counts</button><label className="toggle"><input type="checkbox" checked={session.round.allowMultiple} onChange={(event) => updateRound(sessionId, { allowMultiple: event.target.checked })} />Allow multiple responses</label></div><p className={`status status-${session.round.status}`}>Round status: {session.round.status}</p>{message && <p className="notice">{message}</p>}</section><CircuitPreview circuit={session.experiment.circuit} /><ResultHistogram counts={session.counts} bitCount={session.experiment.circuit.clbitCount} /></main>
}
