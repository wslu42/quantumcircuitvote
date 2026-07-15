import { reviewDistribution } from '../lessons/lessonUtils'
import type { ExpectedDistribution } from '../lessons/types'
import './DistributionComparison.css'

const percent = (value: number) => `${(value * 100).toFixed(value * 100 % 1 ? 1 : 0)}%`

export function DistributionComparison({ counts, expectedDistribution, reveal = true }: { counts: Record<string, number>; expectedDistribution: ExpectedDistribution; reveal?: boolean }) {
  const review = reviewDistribution(counts, expectedDistribution)
  const deterministic = Object.values(expectedDistribution).includes(1)
  return <section className="panel"><div className="section-heading"><div><span className="eyebrow">Class evidence</span><h2>{review.total} class shot{review.total === 1 ? '' : 's'}</h2></div></div>
    {reveal && deterministic && <div className="review-summary"><div><strong>Expected outcome</strong><span>{review.expectedOutcomes[0]}</span></div><div><strong>Unexpected outcomes</strong><span>{review.unexpectedCount}</span></div><div><strong>Observed success rate</strong><span>{percent(review.observedSuccessRate)}</span></div></div>}
    <div className="comparison-table" role="table" aria-label="Observed and expected distribution"><div className="comparison-head" role="row"><strong>Outcome</strong><strong>Observed</strong>{reveal && <strong>Expected</strong>}{reveal && <strong>Deviation</strong>}</div>{review.outcomes.map((item) => <div className="comparison-row" role="row" key={item.outcome}><strong>{item.outcome}</strong><div><span>{item.count} · {percent(item.observed)}</span><div className="bar-track"><div className="bar-fill" style={{ width: `${item.observed * 100}%` }} /></div></div>{reveal && <div><span>{percent(item.expected)}</span><div className="bar-track expected-track"><div className="expected-fill" style={{ width: `${item.expected * 100}%` }} /></div></div>}{reveal && <span>{(item.deviation * 100).toFixed(1)} pp</span>}</div>)}</div>
  </section>
}
