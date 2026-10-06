import { localEstimate } from '../config/foodTable'
import type { FoodBasis, RecentFood } from './food'

export interface Estimate extends FoodBasis {
  /** Pre-filled amount: a count for unit foods, grams for weighed ones. */
  defaultAmount: number
  /** Where the basis came from, so the confirm sheet can say. */
  source: 'claude' | 'local' | 'recent'
  /** Nothing matched and there was no AI — the numbers need filling in. */
  needsManualEntry?: boolean
}

interface ApiResponse {
  name: string
  portion_type: 'unit' | 'weight'
  unit_name: string
  calories_per: number
  protein_per: number
  default_amount: number
}

/**
 * Asks the dev-server route for a Claude estimate, falling back to the local
 * food table if that's unavailable. Never throws — a failure comes back as an
 * empty estimate flagged for manual entry.
 */
export async function estimateFood(query: string): Promise<Estimate> {
  try {
    const res = await fetch('/api/estimate-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (res.ok) {
      const d = (await res.json()) as ApiResponse
      return {
        name: d.name,
        portionType: d.portion_type,
        unitName: d.portion_type === 'unit' ? d.unit_name : undefined,
        perCalories: d.calories_per,
        perProtein: d.protein_per,
        defaultAmount: Math.max(1, d.default_amount),
        source: 'claude',
      }
    }
  } catch {
    /* Offline or no dev server — fall through to the local table. */
  }

  const local = localEstimate(query)
  if (local) return { ...local, source: 'local' }

  return {
    name: query.trim().slice(0, 40),
    portionType: 'weight',
    perCalories: 0,
    perProtein: 0,
    defaultAmount: 100,
    source: 'local',
    needsManualEntry: true,
  }
}

/**
 * Re-logging a recent food reuses its stored basis, so there's no AI call —
 * just pick the amount and confirm. Defaults to what you had last time.
 */
export function estimateFromRecent(food: RecentFood): Estimate {
  return {
    name: food.name,
    portionType: food.portionType,
    unitName: food.unitName,
    perCalories: food.perCalories,
    perProtein: food.perProtein,
    defaultAmount: food.lastAmount,
    source: 'recent',
  }
}
