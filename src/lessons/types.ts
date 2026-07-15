import type { CircuitModel } from '../circuit/types'

export type ExpectedDistribution = Record<string, number>
export type LessonActivity = {
  id: string
  sectionId: string
  order: number
  title: string
  shortTitle: string
  studentInstructions: string
  circuitSource: string
  circuit: CircuitModel
  expectedDistribution: ExpectedDistribution
  conceptSummary: string[]
  reviewNotes?: string[]
}
export type LessonSection = { id: string; title: string; order: number }
export type LessonDefinition = { id: string; title: string; description: string; sections: LessonSection[]; activities: LessonActivity[] }
export type RoundStatus = 'draft' | 'open' | 'closed' | 'revealed'
export type LessonRound = { id: string; activityId: string; status: RoundStatus; allowMultiple: boolean; createdAt: number; openedAt?: number; closedAt?: number; counts: Record<string, number> }
export type LessonSession = { lessonId: string; title: string; activeActivityId: string; activeRoundId: string; createdAt: number }
export type LessonReflection = { id: string; roundId: string; text: string; createdAt: number }
export type ClassroomLessonSession = {
  lesson: LessonSession | null
  activities: Record<string, LessonActivity>
  rounds: Record<string, LessonRound>
  reflections: Record<string, LessonReflection>
}
