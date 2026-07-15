import { get, onValue, push, ref, runTransaction, set, update, type Unsubscribe } from 'firebase/database'
import { foundationsLesson } from '../lessons/foundationsLesson'
import { createLessonRound, validateReflection } from '../lessons/lessonUtils'
import type { ClassroomLessonSession, LessonActivity, LessonRound, RoundStatus } from '../lessons/types'
import { database } from './client'
import { normalizeSessionId } from './sessionRepository'

const emptySession = (): ClassroomLessonSession => ({ lesson: null, activities: {}, rounds: {}, reflections: {} })
const rootRef = (sessionId: string) => ref(database, `sessions/${normalizeSessionId(sessionId)}`)

export function subscribeLessonSession(sessionId: string, listener: (session: ClassroomLessonSession) => void): Unsubscribe {
  return onValue(rootRef(sessionId), (snapshot) => {
    const value = snapshot.val()
    if (!value?.lesson) return listener(emptySession())
    listener({ lesson: value.lesson, activities: value.activities ?? {}, rounds: value.rounds ?? {}, reflections: value.reflections ?? {} })
  })
}

export async function initializeFoundationsLesson(sessionId: string): Promise<string> {
  const now = Date.now()
  const firstActivity = foundationsLesson.activities[0]
  const round = createLessonRound(firstActivity.id, now)
  const activities = Object.fromEntries(foundationsLesson.activities.map((activity) => [activity.id, activity]))
  await update(rootRef(sessionId), {
    lesson: { lessonId: foundationsLesson.id, title: foundationsLesson.title, activeActivityId: firstActivity.id, activeRoundId: round.id, createdAt: now },
    activities,
    [`rounds/${round.id}`]: round,
  })
  return round.id
}

export async function activateActivity(sessionId: string, activityId: string): Promise<string> {
  const snapshot = await get(rootRef(sessionId))
  const activity = snapshot.child(`activities/${activityId}`).val() as LessonActivity | null
  if (!activity) throw new Error('Activity not found in this lesson.')
  const round = createLessonRound(activityId)
  await update(rootRef(sessionId), { 'lesson/activeActivityId': activityId, 'lesson/activeRoundId': round.id, [`rounds/${round.id}`]: round })
  return round.id
}

export async function updateLessonRound(sessionId: string, roundId: string, status: RoundStatus, allowMultiple?: boolean): Promise<void> {
  const now = Date.now()
  const changes: Record<string, unknown> = { status }
  if (allowMultiple !== undefined) changes.allowMultiple = allowMultiple
  if (status === 'open') changes.openedAt = now
  if (status === 'closed' || status === 'revealed') changes.closedAt = now
  await update(ref(database, `sessions/${normalizeSessionId(sessionId)}/rounds/${roundId}`), changes)
}

export async function setAllowMultiple(sessionId: string, roundId: string, allowMultiple: boolean): Promise<void> {
  await set(ref(database, `sessions/${normalizeSessionId(sessionId)}/rounds/${roundId}/allowMultiple`), allowMultiple)
}

export async function resetLessonRound(sessionId: string, roundId: string): Promise<void> {
  await set(ref(database, `sessions/${normalizeSessionId(sessionId)}/rounds/${roundId}/counts`), {})
}

export async function submitLessonOutcome(sessionId: string, roundId: string, outcome: string): Promise<void> {
  const snapshot = await get(rootRef(sessionId))
  const value = snapshot.val()
  const round = value?.rounds?.[roundId] as LessonRound | undefined
  if (!value?.lesson || value.lesson.activeRoundId !== roundId || !round || round.status !== 'open') throw new Error('This response round is no longer open.')
  const activity = value.activities?.[round.activityId] as LessonActivity | undefined
  if (!activity || !new RegExp(`^[01]{${activity.circuit.clbitCount}}$`).test(outcome)) throw new Error('The reported outcome does not match this activity.')
  await runTransaction(ref(database, `sessions/${normalizeSessionId(sessionId)}/rounds/${roundId}/counts/${outcome}`), (count) => (Number(count) || 0) + 1)
}

export async function submitReflection(sessionId: string, roundId: string, text: string): Promise<string> {
  const normalized = validateReflection(text)
  const snapshot = await get(ref(database, `sessions/${normalizeSessionId(sessionId)}/rounds/${roundId}/status`))
  if (snapshot.val() !== 'revealed') throw new Error('Reflections open after the activity is revealed.')
  const reflectionRef = push(ref(database, `sessions/${normalizeSessionId(sessionId)}/reflections`))
  await set(reflectionRef, { id: reflectionRef.key, roundId, text: normalized, createdAt: Date.now() })
  return reflectionRef.key ?? ''
}
