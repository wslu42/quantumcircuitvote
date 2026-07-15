import { useEffect, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { OutcomeSelector } from '../components/OutcomeSelector'
import { submitOutcome, subscribeSession, type ClassroomSession } from '../firebase/sessionRepository'

export function StudentPage({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<ClassroomSession>({ experiment: null, round: null, counts: {} })
  const [message, setMessage] = useState('')
  useEffect(() => subscribeSession(sessionId, setSession), [sessionId])
  const storageKey = session.round ? `quantum-vote:${sessionId}:${session.round.id}` : ''
  const alreadySubmitted = !!storageKey && localStorage.getItem(storageKey) === '1'
  const locked = session.round?.status !== 'open' || (alreadySubmitted && !session.round?.allowMultiple)

  async function submit(outcome: string) {
    if (!session.round) return
    try { await submitOutcome(sessionId, session.round.id, outcome); localStorage.setItem(storageKey, '1'); setMessage(`Response ${outcome} recorded.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Submission failed.') }
  }

  if (!session.experiment) return <main className="single-column"><section className="panel empty"><span className="eyebrow">Student · {sessionId}</span><h1>Waiting for an experiment</h1><p>Your teacher has not published a circuit yet.</p></section></main>
  return <main className="single-column"><section className="hero"><span className="eyebrow">Student experiment · {sessionId}</span><h1>{session.experiment.title}</h1><p className="lede">{session.experiment.instructions}</p><a className="primary link-button" href="https://quantum.cloud.ibm.com/composer" target="_blank" rel="noreferrer">Open IBM Quantum Composer ↗</a></section><CircuitPreview circuit={session.experiment.circuit} /><section className="panel"><span className="eyebrow">Report one shot</span><h2>What did you observe?</h2><p>Select the classical bit string exactly as shown by your run.</p><OutcomeSelector bitCount={session.experiment.circuit.clbitCount} disabled={locked} onSelect={submit} />{session.round?.status !== 'open' && <p className="notice">Responses are currently {session.round?.status ?? 'not available'}.</p>}{alreadySubmitted && !session.round?.allowMultiple && <p className="notice success">You already responded in this round.</p>}{message && <p className="notice">{message}</p>}</section></main>
}
