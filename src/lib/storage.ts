import type { SlotId } from '../config/workouts'
import type { DateKey } from './dates'
import type { FoodEntry, RecentFood } from './food'
import type { Session } from './schedule'

// v3 replaced the flat calories/protein snapshot on food entries with a portion
// type plus a per-unit / per-100g basis. Earlier data is discarded on load
// rather than migrated — it only ever held local test logs.
const KEY = 'workout-app:v3'

/** How far through today's checklist we are, so a reload mid-session is safe. */
export interface WorkoutProgress {
  date: DateKey
  slot: SlotId
  checked: number
}

export interface PersistedState {
  version: 3
  sessions: Session[]
  foodLog: FoodEntry[]
  recentFoods: RecentFood[]
  progress: WorkoutProgress | null
}

export const EMPTY_STATE: PersistedState = {
  version: 3,
  sessions: [],
  foodLog: [],
  recentFoods: [],
  progress: null,
}

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    if (parsed.version !== 3) return EMPTY_STATE
    return {
      version: 3,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      foodLog: Array.isArray(parsed.foodLog) ? parsed.foodLog : [],
      recentFoods: Array.isArray(parsed.recentFoods) ? parsed.recentFoods : [],
      progress: parsed.progress ?? null,
    }
  } catch {
    // Corrupt or unavailable storage (private mode, cleared data) — start fresh
    // rather than crashing the app.
    return EMPTY_STATE
  }
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* Storage full or blocked — the session still works, it just won't persist. */
  }
}
