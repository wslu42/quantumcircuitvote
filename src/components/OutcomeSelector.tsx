import { outcomesFor } from '../circuit/outcomes'

export function OutcomeSelector({ bitCount, disabled, onSelect }: { bitCount: number; disabled: boolean; onSelect: (outcome: string) => void }) {
  const outcomes = outcomesFor(bitCount)
  if (!outcomes.length) return <p className="notice warning">This MVP supports response controls for 1–8 classical bits.</p>
  return <div className="outcome-grid">{outcomes.map((outcome) => <button className="outcome-button" disabled={disabled} key={outcome} onClick={() => onSelect(outcome)}>{outcome}</button>)}</div>
}
