import { describe, expect, it } from 'vitest'
import { outcomesFor } from '../circuit/outcomes'
import { foundationsLesson } from './foundationsLesson'
import { adjacentActivityId, canSubmitToRound, createLessonRound, orderedActivities, reviewDistribution, submissionStorageKey, validateLesson, validateReflection } from './lessonUtils'

const byId = (id: string) => foundationsLesson.activities.find((activity) => activity.id === id)!

describe('Quantum Circuit Foundations lesson', () => {
  it('contains eleven valid ordered activities', () => {
    expect(foundationsLesson.activities).toHaveLength(11)
    expect(validateLesson(foundationsLesson)).toEqual([])
    expect(orderedActivities(foundationsLesson).map((activity) => activity.id)).toEqual(['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'])
  })

  it.each([
    ['a1', { '0': 1, '1': 0 }],
    ['a2', { '0': 0, '1': 1 }],
    ['a3', { '0': 0.5, '1': 0.5 }],
  ])('%s has its required distribution', (id, expected) => expect(byId(id).expectedDistribution).toEqual(expected))

  it('A4 has four outcomes at 25%', () => expect(byId('a4').expectedDistribution).toEqual({ '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 }))
  it('A5 has eight outcomes at 12.5%', () => expect(Object.values(byId('a5').expectedDistribution)).toEqual(Array(8).fill(0.125)))

  it.each([
    ['b2', ['x', 'x']],
    ['b3', ['h', 'h']],
    ['b4', ['x', 'h', 'h']],
    ['b5', ['z']],
    ['b6', ['h', 'z', 'h']],
  ])('%s contains the intended gate sequence', (id, gates) => {
    const actual = byId(id).circuit.operations.filter((operation) => operation.type === 'single').map((operation) => operation.gate)
    expect(actual).toEqual(gates)
  })

  it('enforces previous and next boundaries', () => {
    expect(adjacentActivityId(foundationsLesson, 'a1', -1)).toBeNull()
    expect(adjacentActivityId(foundationsLesson, 'a1', 1)).toBe('a2')
    expect(adjacentActivityId(foundationsLesson, 'b6', 1)).toBeNull()
    expect(adjacentActivityId(foundationsLesson, 'b6', -1)).toBe('b5')
  })

  it('creates independent draft rounds without discarding prior rounds', () => {
    const first = createLessonRound('a1', 100, 'round-1')
    const second = createLessonRound('a1', 200, 'round-2')
    const history = { [first.id]: first, [second.id]: second }
    expect(first.status).toBe('draft')
    expect(Object.keys(history)).toEqual(['round-1', 'round-2'])
  })

  it('calculates observed percentages and unexpected deterministic outcomes', () => {
    const review = reviewDistribution({ '0': 30, '1': 1 }, { '0': 1, '1': 0 })
    expect(review.total).toBe(31)
    expect(review.unexpectedCount).toBe(1)
    expect(review.observedSuccessRate).toBeCloseTo(30 / 31)
    expect(review.outcomes[0].deviation).toBeCloseTo(1 - 30 / 31)
  })

  it('uses display-order bit strings for one, two, and three bits', () => {
    expect(outcomesFor(1)).toEqual(['0', '1'])
    expect(outcomesFor(2)).toEqual(['00', '01', '10', '11'])
    expect(outcomesFor(3)).toEqual(['000', '001', '010', '011', '100', '101', '110', '111'])
  })

  it('keys local submissions by session and round', () => expect(submissionStorageKey('CLASS', 'round-2')).toBe('quantum-vote:CLASS:round-2'))

  it('allows submissions only to the active open round', () => {
    const round = { ...createLessonRound('a1', 100, 'round-1'), status: 'open' as const }
    expect(canSubmitToRound('round-1', round)).toBe(true)
    expect(canSubmitToRound('round-2', round)).toBe(false)
    expect(canSubmitToRound('round-1', { ...round, status: 'closed' })).toBe(false)
  })

  it('validates short non-empty reflections', () => {
    expect(validateReflection('  Interesting result. ')).toBe('Interesting result.')
    expect(() => validateReflection(' ')).toThrow('empty')
    expect(() => validateReflection('x'.repeat(281))).toThrow('280')
  })
})
