import { useState } from 'react'

import type { Estimate } from '../lib/estimateFood'
import { portionLabel, totalsFor, type FoodBasis } from '../lib/food'
import './ConfirmFood.css'

interface Props {
  estimate: Estimate
  meal: string
  onCancel: () => void
  onConfirm: (basis: FoodBasis, amount: number) => void
}

const MAX_GRAMS = 5000
const MAX_UNITS = 99

/**
 * The confirm step. The only thing you set is how much — a tally for counted
 * foods, grams for weighed ones. Calories and protein are derived from the
 * food's stored per-unit / per-100g basis and update as you change it.
 */
export function ConfirmFood({ estimate, meal, onCancel, onConfirm }: Props) {
  const counted = estimate.portionType === 'unit'
  const [amount, setAmount] = useState(estimate.defaultAmount)

  // Only when nothing could be estimated at all, so the food is still loggable.
  const [manual, setManual] = useState({
    calories: String(estimate.perCalories),
    protein: String(estimate.perProtein),
  })

  // Built field by field rather than spread from the estimate, so `source` and
  // `defaultAmount` don't end up stored on every logged entry.
  const basis: FoodBasis = {
    name: estimate.name,
    portionType: estimate.portionType,
    unitName: estimate.unitName,
    perCalories: estimate.needsManualEntry
      ? Number(manual.calories) || 0
      : estimate.perCalories,
    perProtein: estimate.needsManualEntry ? Number(manual.protein) || 0 : estimate.perProtein,
  }

  const totals = totalsFor(basis, amount)
  const step = (by: number) => setAmount((a) => Math.min(MAX_UNITS, Math.max(1, a + by)))

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Confirm food">
      <button type="button" className="sheet__scrim" aria-label="Cancel" onClick={onCancel} />

      <div className="sheet__panel">
        <p className="sheet__eyebrow">{meal}{sourceNote(estimate)}</p>

        <p className="sheet__name">{estimate.name}</p>

        {counted ? (
          <div className="sheet__grams">
            <span className="sheet__grams-label">How many</span>
            <div className="stepper">
              <button
                type="button"
                className="stepper__btn"
                aria-label="One fewer"
                disabled={amount <= 1}
                onClick={() => step(-1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 12h12" />
                </svg>
              </button>
              <span className="stepper__value" aria-live="polite">
                {amount}
              </span>
              <button
                type="button"
                className="stepper__btn"
                aria-label="One more"
                disabled={amount >= MAX_UNITS}
                onClick={() => step(1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <label className="sheet__grams">
            <span className="sheet__grams-label">Amount</span>
            <span className="sheet__grams-field">
              <input
                inputMode="numeric"
                value={amount === 0 ? '' : String(amount)}
                aria-label="Amount in grams"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setAmount(Math.min(MAX_GRAMS, Number(digits) || 0))
                }}
              />
              <span className="sheet__grams-unit">g</span>
            </span>
          </label>
        )}

        {estimate.needsManualEntry && (
          <div className="sheet__manual">
            <p className="sheet__manual-note">
              No estimate for this one — enter its {counted ? 'per-unit' : 'per-100g'} figures.
            </p>
            <div className="sheet__fields">
              <label className="sheet__field">
                <span>Calories</span>
                <input
                  inputMode="numeric"
                  value={manual.calories}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, calories: e.target.value.replace(/\D/g, '') }))
                  }
                />
              </label>
              <label className="sheet__field">
                <span>Protein (g)</span>
                <input
                  inputMode="numeric"
                  value={manual.protein}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, protein: e.target.value.replace(/\D/g, '') }))
                  }
                />
              </label>
            </div>
          </div>
        )}

        <p className="sheet__summary" aria-live="polite">
          {portionLabel(basis, amount)} — {totals.calories} cal, {totals.protein}g protein
        </p>

        <div className="sheet__actions">
          <button type="button" className="sheet__btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="sheet__btn sheet__btn--primary"
            disabled={amount <= 0 || totals.calories + totals.protein === 0}
            onClick={() => onConfirm(basis, amount)}
          >
            Log it
          </button>
        </div>
      </div>
    </div>
  )
}

function sourceNote(estimate: Estimate): string {
  if (estimate.needsManualEntry) return ' · no match'
  if (estimate.source === 'recent') return ' · saved'
  return estimate.source === 'local' ? ' · offline estimate' : ' · estimated'
}
