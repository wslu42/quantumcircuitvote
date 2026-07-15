import { useEffect, useMemo, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { DistributionComparison } from '../components/DistributionComparison'
import { activateActivity, initializeFoundationsLesson, resetLessonRound, setAllowMultiple, subscribeLessonSession, updateLessonRound } from '../firebase/lessonRepository'
import { foundationsLesson } from '../lessons/foundationsLesson'
import { adjacentActivityId, orderedActivities } from '../lessons/lessonUtils'
import type { ClassroomLessonSession, RoundStatus } from '../lessons/types'
import './InstructorPage.css'

const empty: ClassroomLessonSession = { lesson: null, activities: {}, rounds: {}, reflections: {} }

export function InstructorPage({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState(empty)
  const [selectedRoundId, setSelectedRoundId] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => subscribeLessonSession(sessionId, setSession), [sessionId])
  useEffect(() => { if (session.lesson && !session.rounds[selectedRoundId]) setSelectedRoundId(session.lesson.activeRoundId) }, [session, selectedRoundId])
  const activities = orderedActivities(foundationsLesson)
  const activeActivity = session.lesson ? session.activities[session.lesson.activeActivityId] : null
  const activeRound = session.lesson ? session.rounds[session.lesson.activeRoundId] : null
  const selectedRound = session.rounds[selectedRoundId] ?? activeRound
  const selectedActivity = selectedRound ? session.activities[selectedRound.activityId] : activeActivity
  const activityIndex = activeActivity ? activities.findIndex((activity) => activity.id === activeActivity.id) : -1
  const section = activeActivity ? foundationsLesson.sections.find((item) => item.id === activeActivity.sectionId) : null
  const rounds = useMemo(() => Object.values(session.rounds).sort((a, b) => b.createdAt - a.createdAt), [session.rounds])

  async function act(action: () => Promise<unknown>, success: string) { setBusy(true); setMessage(''); try { await action(); setMessage(success) } catch (error) { setMessage(error instanceof Error ? error.message : 'Action failed.') } finally { setBusy(false) } }
  async function move(direction: -1 | 1) { if (!activeActivity) return; const id = adjacentActivityId(foundationsLesson, activeActivity.id, direction); if (id) await act(() => activateActivity(sessionId, id), `Activated ${foundationsLesson.activities.find((item) => item.id === id)?.title}.`) }
  async function status(next: RoundStatus) { if (activeRound) await act(() => updateLessonRound(sessionId, activeRound.id, next), `Round is ${next}.`) }

  if (!session.lesson) return <main className="single-column"><section className="hero"><span className="eyebrow">Instructor · {sessionId}</span><h1>Quantum Circuit Foundations</h1><p className="lede">Load the ordered eleven-activity lesson. Existing legacy session data will remain untouched.</p><button className="primary" disabled={busy} onClick={() => act(() => initializeFoundationsLesson(sessionId), 'Foundations lesson loaded.')}>{busy ? 'Loading…' : 'Load Foundations lesson'}</button>{message && <p className="notice">{message}</p>}</section></main>
  if (!activeActivity || !activeRound) return <main className="single-column"><section className="panel empty"><h1>Lesson data incomplete</h1><p>Reload the Foundations lesson to restore its activity snapshots.</p></section></main>

  const studentUrl = `${location.origin}${location.pathname}#/student?session=${encodeURIComponent(sessionId)}`
  return <main className="instructor-layout"><section className="hero instructor-hero"><span className="eyebrow">Instructor · {sessionId}</span><h1>{session.lesson.title}</h1><p className="lesson-progress">Activity {activityIndex + 1} of {activities.length}<br />Section {section?.order === 1 ? 'A' : 'B'} · {section?.title}</p><div className="student-link"><input readOnly value={studentUrl} aria-label="Student URL" /><button className="secondary" onClick={() => navigator.clipboard.writeText(studentUrl)}>Copy Student URL</button></div>{message && <p className="notice">{message}</p>}</section>
    <aside className="panel lesson-outline"><span className="eyebrow">Lesson sequence</span>{foundationsLesson.sections.map((lessonSection) => <div key={lessonSection.id}><h2>{lessonSection.order === 1 ? 'A' : 'B'} · {lessonSection.title}</h2>{activities.filter((activity) => activity.sectionId === lessonSection.id).map((activity) => <button key={activity.id} className={activity.id === activeActivity.id ? 'activity-link active' : 'activity-link'} onClick={() => act(() => activateActivity(sessionId, activity.id), `Activated ${activity.title}.`)}><span>{activity.order}</span>{activity.title}</button>)}</div>)}</aside>
    <section className="panel instructor-controls"><span className="eyebrow">Active activity</span><h2>{activeActivity.title}</h2><p>{activeActivity.studentInstructions}</p><div className="actions"><button className="secondary" disabled={!adjacentActivityId(foundationsLesson, activeActivity.id, -1) || busy} onClick={() => move(-1)}>Previous</button><button className="secondary" disabled={!adjacentActivityId(foundationsLesson, activeActivity.id, 1) || busy} onClick={() => move(1)}>Next</button><button className="secondary" disabled={busy} onClick={() => act(() => activateActivity(sessionId, activeActivity.id), 'New repeat round created.')}>Repeat as new round</button></div><div className="host-controls"><button className="primary" disabled={busy || activeRound.status === 'open'} onClick={() => status('open')}>Open responses</button><button className="secondary" disabled={busy || activeRound.status !== 'open'} onClick={() => status('closed')}>Close responses</button><button className="secondary" disabled={busy || activeRound.status === 'open'} onClick={() => status('revealed')}>Reveal results</button><button className="secondary" disabled={busy} onClick={() => act(() => resetLessonRound(sessionId, activeRound.id), 'Current round reset.')}>Reset current round</button><label className="toggle"><input type="checkbox" checked={activeRound.allowMultiple} onChange={(event) => act(() => setAllowMultiple(sessionId, activeRound.id, event.target.checked), 'Response setting updated.')} />Allow multiple responses</label></div><p className={`status status-${activeRound.status}`}>Round status: {activeRound.status}</p></section>
    <CircuitPreview circuit={activeActivity.circuit} />
    <section className="panel round-history"><span className="eyebrow">Preserved round history</span><h2>Review a round</h2><label>Round<select value={selectedRound?.id ?? ''} onChange={(event) => setSelectedRoundId(event.target.value)}>{rounds.map((round) => <option key={round.id} value={round.id}>{session.activities[round.activityId]?.shortTitle ?? round.activityId} · {round.status} · {new Date(round.createdAt).toLocaleString()}</option>)}</select></label>{selectedRound && <p>{selectedRound.id === activeRound.id ? 'Active round' : 'Previous round'} · {selectedRound.status}</p>}</section>
    {selectedRound && selectedActivity && <DistributionComparison counts={selectedRound.counts ?? {}} expectedDistribution={selectedActivity.expectedDistribution} reveal={selectedRound.status === 'revealed'} />}
    {selectedRound?.status === 'revealed' && selectedActivity && <section className="panel concept-review"><span className="eyebrow">Concept review</span><h2>{selectedActivity.title}</h2><ul>{selectedActivity.conceptSummary.map((concept) => <li key={concept}>{concept}</li>)}</ul></section>}
  </main>
}
