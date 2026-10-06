import { useEffect, useRef, useState } from 'react'

import type { RecentFood } from '../lib/food'
import './RecentList.css'

/**
 * After a log the tick animates in and the row is locked for this long, so a
 * food can't be logged over and over by accident. Then it reverts to a plus.
 */
const LOCK_MS = 5000

interface Props {
  items: readonly RecentFood[]
  /** Opens the amount step. No AI call — the basis is already stored. */
  onPick: (food: RecentFood) => void
  /**
   * The food logged most recently, to start its lock. A new object per log, so
   * logging the same food twice restarts the lock instead of being deduped.
   */
  justLogged?: { name: string } | null
}

export function RecentList({ items, onPick, justLogged }: Props) {
  const [locked, setLocked] = useState<ReadonlySet<string>>(new Set())
  const timers = useRef(new Map<string, number>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const id of pending.values()) window.clearTimeout(id)
      pending.clear()
    }
  }, [])

  // A confirmed log locks that row, wherever it was started from.
  useEffect(() => {
    if (!justLogged) return
    const key = justLogged.name.toLowerCase()

    setLocked((prev) => new Set(prev).add(key))
    window.clearTimeout(timers.current.get(key))
    timers.current.set(
      key,
      window.setTimeout(() => {
        setLocked((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        timers.current.delete(key)
      }, LOCK_MS),
    )
  }, [justLogged])

  if (items.length === 0) {
    return <p className="recent__empty">Nothing logged yet — search for a food above.</p>
  }

  return (
    <ul className="recent">
      {items.map((item) => {
        const key = item.name.toLowerCase()
        const isLocked = locked.has(key)
        const per =
          item.portionType === 'unit'
            ? `${item.perCalories} kcal · ${item.perProtein}g per ${item.unitName ?? 'unit'}`
            : `${item.perCalories} kcal · ${item.perProtein}g per 100g`

        return (
          <li key={key} className={`recent__item${isLocked ? ' is-flashing' : ''}`}>
            <span className="recent__name">{item.name}</span>
            <span className="recent__macros">{per}</span>
            <button
              type="button"
              className={`recent__action${isLocked ? ' is-checked is-locked' : ''}`}
              disabled={isLocked}
              aria-label={isLocked ? `${item.name} just logged` : `Log ${item.name}`}
              onClick={() => onPick(item)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {isLocked ? <path d="M6 12.5 10.5 17 18 8" /> : <path d="M12 6v12M6 12h12" />}
              </svg>
              {isLocked && <span className="recent__ring" aria-hidden="true" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
