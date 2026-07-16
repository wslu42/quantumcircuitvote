import { useEffect, useMemo, useState } from 'react'
import { CircuitPreview } from '../components/CircuitPreview'
import { DistributionComparison } from '../components/DistributionComparison'
import { activateActivity, initializeFoundationsLesson, resetLessonRound, setAllowMultiple, subscribeLessonSession, updateLessonRound } from '../firebase/lessonRepository'
import { foundationsLesson } from '../lessons/foundationsLesson'
import { adjacentActivityId, instructorPrimaryAction, orderedActivities } from '../lessons/lessonUtils'
import type { ClassroomLessonSession, RoundStatus } from '../lessons/types'
import './InstructorPage.css'

const empty: ClassroomLessonSession = { lesson: null, activities: {}, rounds: {}, reflections: {} }

export function InstructorPage({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState(empty)
  const [selectedRoundId, setSelectedRoundId] = useState('')
  const [selectedActivityId, setSelectedActivityId] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => subscribeLessonSession(sessionId, setSession), [sessionId])
  useEffect(() => { if (session.lesson && !selectedActivityId) { setSelectedActivityId(session.lesson.activeActivityId); setSelectedRoundId(session.lesson.activeRoundId) } }, [session, selectedActivityId])
  const activities = orderedActivities(foundationsLesson)
  const activeActivity = session.lesson ? session.activities[session.lesson.activeActivityId] : null
  const activeRound = session.lesson ? session.rounds[session.lesson.activeRoundId] : null
  const selectedRound = session.rounds[selectedRoundId] ?? null
  const selectedActivity = session.activities[selectedRound?.activityId ?? selectedActivityId] ?? activeActivity
  const activityIndex = activeActivity ? activities.findIndex((activity) => activity.id === activeActivity.id) : -1
  const section = activeActivity ? foundationsLesson.sections.find((item) => item.id === activeActivity.sectionId) : null
  const rounds = useMemo(() => Object.values(session.rounds).sort((a, b) => b.createdAt - a.createdAt), [session.rounds])
  const totalResponses = Object.values(activeRound?.counts ?? {}).reduce((sum, count) => sum + count, 0)
  const nextActivityId = activeActivity ? adjacentActivityId(foundationsLesson, activeActivity.id, 1) : null
  const primaryAction = activeRound ? instructorPrimaryAction(activeRound.status, !!nextActivityId) : 'open'

  async function act(action: () => Promise<unknown>, success: string) { setBusy(true); setMessage(''); try { await action(); setMessage(success) } catch (error) { setMessage(error instanceof Error ? error.message : 'Action failed.') } finally { setBusy(false) } }
  async function status(next: RoundStatus) { if (activeRound) await act(() => updateLessonRound(sessionId, activeRound.id, next), `Round is ${next}.`) }
  async function makeLive(activityId: string, success: string) {
    setBusy(true); setMessage('')
    try { const roundId = await activateActivity(sessionId, activityId); setSelectedActivityId(activityId); setSelectedRoundId(roundId); setMessage(success) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Action failed.') }
    finally { setBusy(false) }
  }
  function selectActivity(activityId: string) {
    setSelectedActivityId(activityId)
    const latest = rounds.find((round) => round.activityId === activityId)
    setSelectedRoundId(latest?.id ?? '')
  }
  async function runPrimaryAction() {
    if (primaryAction === 'open') return status('open')
    if (primaryAction === 'reveal') return status('revealed')
    if (primaryAction === 'next' && nextActivityId) return makeLive(nextActivityId, `Activated ${session.activities[nextActivityId]?.title}.`)
    setMessage('Lesson complete. All eleven activities have been revealed.')
  }
  const primaryLabel = primaryAction === 'open' ? 'Open responses' : primaryAction === 'reveal' ? 'Close & reveal results' : primaryAction === 'next' ? 'Next activity' : 'Lesson complete'

  if (!session.lesson) return <main className="single-column"><section className="hero"><span className="eyebrow">Instructor · {sessionId}</span><h1>Quantum Circuit Foundations</h1><p className="lede">Load the ordered eleven-activity lesson. Existing legacy session data will remain untouched.</p><button className="primary" disabled={busy} onClick={() => act(() => initializeFoundationsLesson(sessionId), 'Foundations lesson loaded.')}>{busy ? 'Loading…' : 'Load Foundations lesson'}</button>{message && <p className="notice">{message}</p>}</section></main>
  if (!activeActivity || !activeRound) return <main className="single-column"><section className="panel empty"><h1>Lesson data incomplete</h1><p>Reload the Foundations lesson to restore its activity snapshots.</p></section></main>

  const studentUrl = `${location.origin}${location.pathname}#/student?session=${encodeURIComponent(sessionId)}`
  return <main className="instructor-layout"><section className="hero instructor-hero"><span className="eyebrow">Instructor · {sessionId}</span><div className="live-banner"><strong>LIVE: Activity {activityIndex + 1} — {activeActivity.title}</strong><span>{activeRound.status === 'open' ? `Responses open · ${totalResponses} submissions` : `Round ${activeRound.status} · ${totalResponses} submissions`}</span></div><h1>{session.lesson.title}</h1><p className="lesson-progress">Activity {activityIndex + 1} of {activities.length}<br />Section {section?.order === 1 ? 'A' : 'B'} · {section?.title}</p><div className="student-link"><input readOnly value={studentUrl} aria-label="Student URL" /><button className="secondary" onClick={() => navigator.clipboard.writeText(studentUrl)}>Copy Student URL</button></div>{message && <p className="notice">{message}</p>}</section>
    <aside className="panel lesson-outline"><span className="eyebrow">Lesson sequence</span><p className="outline-help">Select an activity to review it. This does not change what students see.</p>{foundationsLesson.sections.map((lessonSection) => <div key={lessonSection.id}><h2>{lessonSection.order === 1 ? 'A' : 'B'} · {lessonSection.title}</h2>{activities.filter((activity) => activity.sectionId === lessonSection.id).map((activity) => { const classes = ['activity-link', activity.id === activeActivity.id ? 'active' : '', activity.id === selectedActivity?.id ? 'selected' : ''].filter(Boolean).join(' '); return <button key={activity.id} className={classes} onClick={() => selectActivity(activity.id)}><span>{activity.order}</span>{activity.title}{activity.id === activeActivity.id && <small>LIVE</small>}</button> })}</div>)}{selectedActivity && selectedActivity.id !== activeActivity.id && <button className="primary make-live" disabled={busy} onClick={() => makeLive(selectedActivity.id, `Activated ${selectedActivity.title}.`)}>Make {selectedActivity.shortTitle} live</button>}</aside>
    <section className="panel instructor-controls"><span className="eyebrow">Active activity</span><h2>{activeActivity.title}</h2><p>{activeActivity.studentInstructions}</p><div className="primary-workflow"><button className="primary workflow-button" disabled={busy || primaryAction === 'complete'} onClick={runPrimaryAction}>{primaryLabel}</button>{activeRound.status === 'open' && <button className="secondary" disabled={busy} onClick={() => status('closed')}>Close without revealing</button>}</div><details><summary>Round options</summary><div className="host-controls"><button className="secondary" disabled={busy} onClick={() => makeLive(activeActivity.id, 'New repeat round created.')}>Repeat activity as new round</button><button className="secondary" disabled={busy || activeRound.status === 'open'} onClick={() => act(() => resetLessonRound(sessionId, activeRound.id), 'Current round reset.')}>Reset current round</button><label className="toggle"><input type="checkbox" checked={activeRound.allowMultiple} onChange={(event) => act(() => setAllowMultiple(sessionId, activeRound.id, event.target.checked), 'Response setting updated.')} />Allow multiple responses</label></div></details><p className={`status status-${activeRound.status}`}>Round status: {activeRound.status}</p></section>
    <CircuitPreview circuit={activeActivity.circuit} />
    <section className="panel round-history"><span className="eyebrow">Preserved round history</span><h2>Review a round</h2><label>Round<select value={selectedRound?.id ?? ''} onChange={(event) => { const round = session.rounds[event.target.value]; setSelectedRoundId(event.target.value); if (round) setSelectedActivityId(round.activityId) }}><option value="">No round selected</option>{rounds.map((round) => <option key={round.id} value={round.id}>{session.activities[round.activityId]?.shortTitle ?? round.activityId} · {round.status} · {new Date(round.createdAt).toLocaleString()}</option>)}</select></label>{selectedRound && <p>{selectedRound.id === activeRound.id ? 'Active round' : 'Previous round'} · {selectedRound.status}</p>}</section>
    {selectedRound && selectedActivity && <DistributionComparison counts={selectedRound.counts ?? {}} expectedDistribution={selectedActivity.expectedDistribution} reveal={selectedRound.status === 'revealed'} />}
    {selectedRound?.status === 'revealed' && selectedActivity && <section className="panel concept-review"><span className="eyebrow">Concept review</span><h2>{selectedActivity.title}</h2><ul>{selectedActivity.conceptSummary.map((concept) => <li key={concept}>{concept}</li>)}</ul></section>}
  </main>
}
