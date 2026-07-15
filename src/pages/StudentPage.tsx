import { useEffect, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { DistributionComparison } from '../components/DistributionComparison'
import { OutcomeSelector } from '../components/OutcomeSelector'
import { submitLessonOutcome, submitReflection, subscribeLessonSession } from '../firebase/lessonRepository'
import { foundationsLesson } from '../lessons/foundationsLesson'
import { submissionStorageKey } from '../lessons/lessonUtils'
import type { ClassroomLessonSession } from '../lessons/types'

const empty: ClassroomLessonSession = { lesson: null, activities: {}, rounds: {}, reflections: {} }

export function StudentPage({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState(empty)
  const [message, setMessage] = useState('')
  const [reflection, setReflection] = useState('')
  useEffect(() => subscribeLessonSession(sessionId, setSession), [sessionId])
  const activity = session.lesson ? session.activities[session.lesson.activeActivityId] : null
  const round = session.lesson ? session.rounds[session.lesson.activeRoundId] : null
  const storageKey = round ? submissionStorageKey(sessionId, round.id) : ''
  const alreadySubmitted = !!storageKey && localStorage.getItem(storageKey) === '1'
  const locked = round?.status !== 'open' || (alreadySubmitted && !round?.allowMultiple)
  const index = activity ? foundationsLesson.activities.findIndex((item) => item.id === activity.id) : -1
  const section = activity ? foundationsLesson.sections.find((item) => item.id === activity.sectionId) : null

  async function submit(outcome: string) {
    if (!round) return
    try { await submitLessonOutcome(sessionId, round.id, outcome); localStorage.setItem(storageKey, '1'); setMessage(`Response ${outcome} recorded.`) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Submission failed.') }
  }

  async function reflect() {
    if (!round) return
    try { await submitReflection(sessionId, round.id, reflection); setReflection(''); setMessage('Reflection submitted.') }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Reflection failed.') }
  }

  if (!session.lesson || !activity || !round) return <main className="single-column"><section className="panel empty"><span className="eyebrow">Student · {sessionId}</span><h1>Waiting for the lesson</h1><p>Your instructor has not loaded a Foundations activity yet.</p></section></main>
  const revealed = round.status === 'revealed'
  return <main className="single-column"><section className="hero"><span className="eyebrow">{session.lesson.title} · Student</span><p className="lesson-progress">Activity {index + 1} of {foundationsLesson.activities.length}<br />Section {section?.order === 1 ? 'A' : 'B'} · {section?.title}</p><h1>{activity.title}</h1><p className="lede">{activity.studentInstructions}</p><a className="primary link-button" href="https://quantum.cloud.ibm.com/composer" target="_blank" rel="noreferrer">Open IBM Quantum Composer ↗</a></section>
    <CircuitPreview circuit={activity.circuit} />
    <section className="panel"><span className="eyebrow">Report one shot</span><h2>What did you observe?</h2><p>Report the bit string exactly as displayed by IBM Quantum Composer.</p><details><summary>How is the bit string ordered?</summary><p>Transcribe IBM Composer's displayed classical string without reversing it. In Qiskit-style display order, the highest-index classical bit appears at the left.</p></details><OutcomeSelector bitCount={activity.circuit.clbitCount} disabled={locked} onSelect={submit} />{round.status !== 'open' && <p className="notice">Responses are currently {round.status}.</p>}{alreadySubmitted && !round.allowMultiple && <p className="notice success">You already responded in this round.</p>}{message && <p className="notice">{message}</p>}</section>
    {revealed && <DistributionComparison counts={round.counts ?? {}} expectedDistribution={activity.expectedDistribution} />}
    {revealed && <section className="panel"><span className="eyebrow">What the distribution reveals</span><h2>Concept summary</h2><ul>{activity.conceptSummary.map((concept) => <li key={concept}>{concept}</li>)}</ul><label>What surprised you about the class result?<textarea maxLength={280} value={reflection} onChange={(event) => setReflection(event.target.value)} /></label><div className="actions"><button className="primary" disabled={!reflection.trim()} onClick={reflect}>Submit reflection</button><span>{reflection.length}/280</span></div></section>}
  </main>
}
