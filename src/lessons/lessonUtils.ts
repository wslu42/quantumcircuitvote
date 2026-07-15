import { outcomesFor } from '../circuit/outcomes'
import type { ExpectedDistribution, LessonActivity, LessonDefinition, LessonRound } from './types'

export function orderedActivities(lesson: LessonDefinition): LessonActivity[] {
  return [...lesson.activities].sort((a, b) => a.order - b.order)
}

export function adjacentActivityId(lesson: LessonDefinition, activeId: string, direction: -1 | 1): string | null {
  const activities = orderedActivities(lesson)
  const index = activities.findIndex((activity) => activity.id === activeId)
  const adjacent = activities[index + direction]
  return adjacent?.id ?? null
}

export function createLessonRound(activityId: string, now = Date.now(), id = `${now.toString(36)}-${crypto.randomUUID().slice(0, 8)}`): LessonRound {
  return { id, activityId, status: 'draft', allowMultiple: false, createdAt: now, counts: {} }
}

export function submissionStorageKey(sessionId: string, roundId: string): string {
  return `quantum-vote:${sessionId}:${roundId}`
}

export function canSubmitToRound(activeRoundId: string, round: LessonRound | null): boolean {
  return !!round && round.id === activeRoundId && round.status === 'open'
}

export function validateReflection(text: string): string {
  const normalized = text.trim()
  if (!normalized) throw new Error('Reflection cannot be empty.')
  if (normalized.length > 280) throw new Error('Reflection must be 280 characters or fewer.')
  return normalized
}

export function validateLesson(lesson: LessonDefinition): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const orders = new Set<number>()
  for (const activity of lesson.activities) {
    if (ids.has(activity.id)) errors.push(`Duplicate activity ID ${activity.id}.`)
    if (orders.has(activity.order)) errors.push(`Duplicate activity order ${activity.order}.`)
    ids.add(activity.id); orders.add(activity.order)
    const validOutcomes = new Set(outcomesFor(activity.circuit.clbitCount))
    for (const key of Object.keys(activity.expectedDistribution)) if (!validOutcomes.has(key)) errors.push(`${activity.id} has invalid outcome ${key}.`)
    const sum = Object.values(activity.expectedDistribution).reduce((total, probability) => total + probability, 0)
    if (Math.abs(sum - 1) > 1e-9) errors.push(`${activity.id} probabilities sum to ${sum}.`)
  }
  return errors
}

export type OutcomeReview = { outcome: string; count: number; observed: number; expected: number; deviation: number }
export type DistributionReview = { total: number; outcomes: OutcomeReview[]; expectedOutcomes: string[]; expectedCount: number; unexpectedCount: number; observedSuccessRate: number }

export function reviewDistribution(counts: Record<string, number>, expected: ExpectedDistribution): DistributionReview {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const keys = [...new Set([...Object.keys(expected), ...Object.keys(counts)])].sort()
  const outcomes = keys.map((outcome) => {
    const count = counts[outcome] ?? 0
    const observed = total ? count / total : 0
    const target = expected[outcome] ?? 0
    return { outcome, count, observed, expected: target, deviation: Math.abs(observed - target) }
  })
  const expectedOutcomes = Object.entries(expected).filter(([, probability]) => probability > 0).map(([outcome]) => outcome)
  const deterministicOutcome = Object.entries(expected).find(([, probability]) => probability === 1)?.[0]
  const expectedCount = deterministicOutcome ? counts[deterministicOutcome] ?? 0 : 0
  const unexpectedCount = deterministicOutcome ? total - expectedCount : outcomes.filter((item) => item.expected === 0).reduce((sum, item) => sum + item.count, 0)
  return { total, outcomes, expectedOutcomes, expectedCount, unexpectedCount, observedSuccessRate: total && deterministicOutcome ? expectedCount / total : 0 }
}
