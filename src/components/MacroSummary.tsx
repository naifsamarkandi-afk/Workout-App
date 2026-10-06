import { DAILY_GOALS } from '../config/goals'
import type { Macros } from '../lib/food'
import { MacroRing } from './MacroRing'
import './MacroSummary.css'

function pctConsumed(goal: number, eaten: number): number {
  return Math.min(1, Math.max(0, eaten / goal))
}

/**
 * Below the goal we count down what's left. Past it we count up the overshoot,
 * otherwise the bar pins at "0 left" and looks frozen no matter what you log.
 */
function readout(goal: number, eaten: number, unit: string) {
  const diff = Math.round(goal - eaten)
  return diff >= 0
    ? { value: diff, unit: `${unit} left`, over: false }
    : { value: -diff, unit: `${unit} over`, over: true }
}

export function MacroSummary({ eaten }: { eaten: Macros }) {
  // Unit strings carry their own leading space (the row has no gap), so protein
  // reads "160g protein left" exactly as specified.
  const cal = readout(DAILY_GOALS.calories, eaten.calories, ' kcal')
  const pro = readout(DAILY_GOALS.protein, eaten.protein, 'g protein')

  return (
    <section className="macros" aria-label="Food intake">
      <div className="macros__bars">
        <MacroBar
          variant="cal"
          value={cal.value}
          unit={cal.unit}
          over={cal.over}
          fill={pctConsumed(DAILY_GOALS.calories, eaten.calories)}
          srLabel={`${cal.value} calories ${cal.over ? 'over' : 'left'} today`}
        />
        <MacroBar
          variant="pro"
          value={pro.value}
          unit={pro.unit}
          over={pro.over}
          fill={pctConsumed(DAILY_GOALS.protein, eaten.protein)}
          srLabel={`${pro.value} grams of protein ${pro.over ? 'over' : 'left'} today`}
        />
      </div>

      <MacroRing
        calories={pctConsumed(DAILY_GOALS.calories, eaten.calories)}
        protein={pctConsumed(DAILY_GOALS.protein, eaten.protein)}
      />
    </section>
  )
}

interface BarProps {
  variant: 'cal' | 'pro'
  value: number
  unit: string
  over: boolean
  fill: number
  srLabel: string
}

function MacroBar({ variant, value, unit, over, fill, srLabel }: BarProps) {
  // Keep a sliver of fill visible at 0% so the number always has a backing.
  const width = `${Math.max(34, fill * 100)}%`
  return (
    <div className={`bar bar--${variant}${over ? ' is-over' : ''}`}>
      <div className="bar__fill" style={{ width }} />
      <div className="bar__text">
        <span className="bar__row">
          <span className="bar__value">{value}</span>
          <span className="bar__unit">{unit}</span>
        </span>
      </div>
      <span className="sr-only">{srLabel}</span>
    </div>
  )
}
