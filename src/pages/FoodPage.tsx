import { useMemo, useState, type FormEvent } from 'react'

import { ConfirmFood } from '../components/ConfirmFood'
import { RecentList } from '../components/RecentList'
import { basisFor, defaultAmountFor, suggestFoods, type FoodRow } from '../config/foodTable'
import { MEALS, type FoodBasis, type MealId, type RecentFood } from '../lib/food'
import { estimateFood, estimateFromRecent, type Estimate } from '../lib/estimateFood'
import { useStore } from '../state/store'
import './FoodPage.css'

export function FoodPage() {
  const { recentFoods, logFood } = useStore()

  const [meal, setMeal] = useState<MealId | null>(null)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Estimate | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [justLogged, setJustLogged] = useState<{ name: string } | null>(null)
  // Hidden once a suggestion is taken, so the list doesn't reappear over the sheet.
  const [showSuggestions, setShowSuggestions] = useState(true)

  const suggestions = useMemo(
    () => (showSuggestions && !pending ? suggestFoods(query) : []),
    [query, showSuggestions, pending],
  )

  const requireMeal = (): boolean => {
    if (meal) return true
    setHint('Pick a meal first.')
    return false
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q || busy) return
    if (!requireMeal()) return

    setBusy(true)
    setHint(null)
    setShowSuggestions(false)
    setPending(await estimateFood(q))
    setBusy(false)
  }

  /** Tapping a suggestion skips the round trip — the table already has it. */
  const pickSuggestion = (row: FoodRow) => {
    if (!requireMeal()) return
    setQuery(row.label)
    setShowSuggestions(false)
    setHint(null)
    setPending({ ...basisFor(row), defaultAmount: defaultAmountFor(row), source: 'local' })
  }

  /** Re-logging a recent food reuses its stored basis — no AI call. */
  const pickRecent = (food: RecentFood) => {
    if (!requireMeal()) return
    setHint(null)
    setPending(estimateFromRecent(food))
  }

  const confirm = (basis: FoodBasis, amount: number) => {
    if (!meal) return
    logFood(basis, amount, meal)
    // A fresh object each time, so logging the same food twice still restarts
    // the row's lock rather than being deduped as an unchanged value.
    setJustLogged({ name: basis.name })
    setPending(null)
    setQuery('')
  }

  return (
    <div className="page food">
      <div className="search-wrap">
        <form className="search" onSubmit={handleSearch}>
          <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            className="search__input"
            type="search"
            value={query}
            placeholder="Search foods"
            enterKeyHint="search"
            aria-label="Search foods"
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
          />
          {busy && <span className="search__spinner" aria-label="Estimating" />}
        </form>

        {suggestions.length > 0 && (
          <ul className="suggest">
            {suggestions.map((row) => (
              <li key={row.label}>
                <button type="button" className="suggest__item" onClick={() => pickSuggestion(row)}>
                  <span className="suggest__name">{row.label}</span>
                  <span className="suggest__macros">
                    {row.unit
                      ? `${Math.round((row.calories * (row.unitGrams ?? 100)) / 100)} kcal per ${row.unit}`
                      : `${row.calories} kcal · ${row.protein}g / 100g`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="meals" role="group" aria-label="Meal">
        {MEALS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`meals__btn${meal === m.id ? ' is-active' : ''}`}
            aria-pressed={meal === m.id}
            onClick={() => {
              setMeal(m.id)
              setHint(null)
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {hint && <p className="food__hint">{hint}</p>}

      <h2 className="food__heading">Recently logged</h2>
      <RecentList items={recentFoods} onPick={pickRecent} justLogged={justLogged} />

      {pending && (
        <ConfirmFood
          estimate={pending}
          meal={MEALS.find((m) => m.id === meal)?.label ?? ''}
          onCancel={() => setPending(null)}
          onConfirm={confirm}
        />
      )}
    </div>
  )
}
