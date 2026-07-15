import { outcomesFor } from '../circuit/outcomes'

export function ResultHistogram({ counts, bitCount }: { counts: Record<string, number>; bitCount: number }) {
  const outcomes = outcomesFor(bitCount)
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const max = Math.max(1, ...outcomes.map((outcome) => counts[outcome] ?? 0))
  return <section className="panel"><div className="section-heading"><div><span className="eyebrow">Live evidence</span><h2>{total} response{total === 1 ? '' : 's'}</h2></div></div><div className="histogram">{outcomes.map((outcome) => { const count = counts[outcome] ?? 0; return <div className="bar-row" key={outcome}><strong>{outcome}</strong><div className="bar-track"><div className="bar-fill" style={{ width: `${(count / max) * 100}%` }} /></div><span>{count}</span></div>})}</div></section>
}
