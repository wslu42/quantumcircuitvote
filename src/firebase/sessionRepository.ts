import { get, onValue, ref, runTransaction, set, update, type Unsubscribe } from 'firebase/database'
import type { CircuitModel } from '../circuit/types'
import { database } from './client'

export type RoundStatus = 'draft' | 'open' | 'closed'
export type PublishedExperiment = { title: string; instructions: string; circuitSource: string; circuit: CircuitModel; updatedAt: number }
export type SessionRound = { id: string; status: RoundStatus; allowMultiple: boolean }
export type ClassroomSession = { experiment: PublishedExperiment | null; round: SessionRound | null; counts: Record<string, number> }

export function normalizeSessionId(value: string): string {
  const normalized = value.trim().toUpperCase()
  if (!/^[A-Z0-9_-]{2,24}$/.test(normalized)) throw new Error('Session code must be 2–24 letters, numbers, dashes, or underscores.')
  return normalized
}

const sessionRef = (sessionId: string) => ref(database, `sessions/${normalizeSessionId(sessionId)}`)

export function subscribeSession(sessionId: string, listener: (session: ClassroomSession) => void): Unsubscribe {
  return onValue(sessionRef(sessionId), (snapshot) => {
    const value = snapshot.val() ?? {}
    listener({ experiment: value.experiment ?? null, round: value.round ?? null, counts: value.counts ?? {} })
  })
}

export async function publishExperiment(sessionId: string, data: Omit<PublishedExperiment, 'updatedAt'>): Promise<string> {
  const roundId = `${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`
  await update(sessionRef(sessionId), { experiment: { ...data, updatedAt: Date.now() }, round: { id: roundId, status: 'draft', allowMultiple: false }, counts: null })
  return roundId
}

export async function updateRound(sessionId: string, changes: Partial<Pick<SessionRound, 'status' | 'allowMultiple'>>): Promise<void> {
  await update(ref(database, `sessions/${normalizeSessionId(sessionId)}/round`), changes)
}

export async function resetCounts(sessionId: string): Promise<void> {
  await set(ref(database, `sessions/${normalizeSessionId(sessionId)}/counts`), {})
}

export async function submitOutcome(sessionId: string, expectedRoundId: string, outcome: string): Promise<void> {
  const root = sessionRef(sessionId)
  const snapshot = await get(root)
  const value = snapshot.val()
  if (!value?.round || value.round.id !== expectedRoundId || value.round.status !== 'open') throw new Error('This response round is no longer open.')
  if (!new RegExp(`^[01]{${value.experiment?.circuit?.clbitCount ?? 0}}$`).test(outcome)) throw new Error('The reported outcome does not match this circuit.')
  await runTransaction(ref(database, `sessions/${normalizeSessionId(sessionId)}/counts/${outcome}`), (count) => (Number(count) || 0) + 1)
}
