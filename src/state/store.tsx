import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

import { WORKOUTS_PER_WEEK } from '../config/goals'
import type { BodyPart, SlotId } from '../config/workouts'
import { addDays, endOfWeek, startOfWeek, todayKey, type DateKey } from '../lib/dates'
import {
  pushRecent,
  totalsFor,
  totalsForDate,
  type FoodBasis,
  type FoodEntry,
  type MealId,
  type Macros,
  type RecentFood,
} from '../lib/food'
import {
  activeSlot,
  buildSchedule,
  nextWorkout,
  workoutsInWeek,
  type DayPlan,
  type Session,
} from '../lib/schedule'
import { EMPTY_STATE, loadState, saveState, type PersistedState } from '../lib/storage'

type Action =
  | { type: 'completeWorkout'; slot: SlotId; date: DateKey; at: string }
  | { type: 'setProgress'; date: DateKey; slot: SlotId; checked: number }
  | { type: 'logFood'; entry: FoodEntry }
  | { type: 'reset' }

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case 'completeWorkout': {
      // One session per day. Re-completing the same day replaces it rather than
      // double-counting toward the week.
      const sessions = state.sessions.filter((s) => s.date !== action.date)
      const next: Session = { date: action.date, slot: action.slot, completedAt: action.at }
      return {
        ...state,
        sessions: [...sessions, next].sort((a, b) => a.date.localeCompare(b.date)),
        progress: null,
      }
    }
    case 'setProgress':
      return {
        ...state,
        progress: { date: action.date, slot: action.slot, checked: action.checked },
      }
    case 'logFood': {
      const { entry } = action
      return {
        ...state,
        foodLog: [...state.foodLog, entry],
        recentFoods: pushRecent(state.recentFoods, entry),
      }
    }
    case 'reset':
      return EMPTY_STATE
  }
}

interface StoreValue {
  today: DateKey
  sessions: readonly Session[]
  foodLog: readonly FoodEntry[]
  recentFoods: readonly RecentFood[]

  /** The current Sunday–Saturday week, one entry per day. */
  week: DayPlan[]
  todayPlan: DayPlan | null
  /** Next workout still to do (today's, or the upcoming one on a rest day). */
  upcoming: DayPlan | null
  /** Which character the homepage should show today. */
  characterBody: BodyPart
  /** Which exercise list the workout page should show. */
  currentSlot: SlotId
  /** Today's logged session, if there is one. Locks the workout page. */
  todaySession: Session | null
  workoutsThisWeek: number
  workoutsGoal: number
  eatenToday: Macros
  /** Checklist position for today's session; 0 unless one is under way. */
  checkedCount: number

  setCheckedCount: (slot: SlotId, checked: number) => void
  completeWorkout: (slot: SlotId) => void
  /** Amount is a count for unit foods, grams for weighed ones. */
  logFood: (basis: FoodBasis, amount: number, meal: MealId) => void
  resetAll: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

/**
 * crypto.randomUUID only exists in a secure context, and opening the dev server
 * from a phone over http://192.168.x.x is not one — so fall back by hand.
 */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [today, setToday] = useState<DateKey>(todayKey)

  useEffect(() => {
    saveState(state)
  }, [state])

  // Roll the app over to the new day without needing a reload — matters if the
  // phone sits open overnight, or comes back from being backgrounded.
  useEffect(() => {
    const tick = () => setToday((prev) => (todayKey() === prev ? prev : todayKey()))
    const id = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])

  const value = useMemo<StoreValue>(() => {
    const weekStart = startOfWeek(today)
    const weekEnd = endOfWeek(today)
    const week = buildSchedule(state.sessions, today, weekStart, weekEnd)

    // A week either side: ahead so "next workout" still resolves when the rest
    // of this week is all rest days, behind so yesterday is available even on a
    // Sunday.
    const horizon = buildSchedule(
      state.sessions,
      today,
      addDays(weekStart, -7),
      endOfWeek(weekEnd),
    )
    const slot = activeSlot(horizon, today)

    const todayPlan = week.find((d) => d.isToday) ?? null
    const yesterday = horizon.find((d) => d.date === addDays(today, -1))
    const upcoming = nextWorkout(horizon, today)

    // On a workout day, today's character. On a rest day, the one you just
    // trained — the cycle always puts rest after a lower day and before an
    // upper one, so keying off the next workout would only ever show upper and
    // the lower rest animation would never appear.
    const characterBody: BodyPart =
      todayPlan?.body ??
      (yesterday?.kind === 'work' ? yesterday.body : null) ??
      upcoming?.body ??
      'upper'

    // Stale progress from a previous day or a different slot doesn't carry over.
    const progress = state.progress
    const checkedCount =
      progress && progress.date === today && progress.slot === slot ? progress.checked : 0

    return {
      today,
      sessions: state.sessions,
      foodLog: state.foodLog,
      recentFoods: state.recentFoods,

      week,
      todayPlan,
      upcoming,
      characterBody,
      currentSlot: slot,
      todaySession: state.sessions.find((s) => s.date === today) ?? null,
      workoutsThisWeek: workoutsInWeek(state.sessions, weekStart, weekEnd),
      workoutsGoal: WORKOUTS_PER_WEEK,
      eatenToday: totalsForDate(state.foodLog, today),
      checkedCount,

      setCheckedCount: (s, checked) => dispatch({ type: 'setProgress', date: today, slot: s, checked }),
      completeWorkout: (slot) =>
        dispatch({ type: 'completeWorkout', slot, date: today, at: new Date().toISOString() }),
      logFood: (basis, amount, meal) =>
        dispatch({
          type: 'logFood',
          entry: {
            ...basis,
            ...totalsFor(basis, amount),
            amount,
            meal,
            id: newId(),
            date: today,
            loggedAt: new Date().toISOString(),
          },
        }),
      resetAll: () => dispatch({ type: 'reset' }),
    }
  }, [state, today])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
