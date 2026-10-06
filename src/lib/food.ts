import type { DateKey } from './dates'

export type MealId = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export const MEALS: { id: MealId; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'snack', label: 'Snack' },
  { id: 'dinner', label: 'Dinner' },
]

/**
 * How a food is portioned, decided once when it's first estimated.
 *
 *   unit   — eaten in whole things (eggs, bars). Amount is a count.
 *   weight — eaten in amounts (rice, yogurt). Amount is grams.
 */
export type PortionType = 'unit' | 'weight'

/**
 * The nutrition basis for a food, independent of how much you ate. Stored with
 * every recent food so re-logging can skip the AI call entirely.
 */
export interface FoodBasis {
  name: string
  portionType: PortionType
  /** Singular unit name for counted foods: "egg", "bar", "slice". */
  unitName?: string
  /** Calories per single unit, or per 100 g for weighed foods. */
  perCalories: number
  /** Protein per single unit, or per 100 g for weighed foods. */
  perProtein: number
}

/** One logged food. Tagged with the meal so the history is useful later. */
export interface FoodEntry extends FoodBasis {
  id: string
  meal: MealId
  /** Count for unit foods, grams for weighed foods. */
  amount: number
  /** Totals, kept alongside so day sums don't have to recompute. */
  calories: number
  protein: number
  date: DateKey
  loggedAt: string
}

/** A one-tap shortcut. The list holds at most RECENT_LIMIT of these, most recent first. */
export interface RecentFood extends FoodBasis {
  /** What you had last time — the amount this food defaults to. */
  lastAmount: number
  lastLoggedAt: string
}

export const RECENT_LIMIT = 4

export interface Macros {
  calories: number
  protein: number
}

/** Scale a food's basis by an amount: a count, or grams over 100. */
export function totalsFor(basis: FoodBasis, amount: number): Macros {
  const multiplier = basis.portionType === 'unit' ? amount : amount / 100
  return {
    calories: Math.max(0, Math.round(basis.perCalories * multiplier)),
    protein: Math.max(0, Math.round(basis.perProtein * multiplier)),
  }
}

function plural(word: string, n: number): string {
  if (n === 1) return word
  return /(s|x|ch|sh)$/.test(word) ? `${word}es` : `${word}s`
}

/** "3 eggs" or "250g", for the confirm step and the log. */
export function portionLabel(basis: FoodBasis, amount: number): string {
  if (basis.portionType === 'weight') return `${amount}g`
  return `${amount} ${plural(basis.unitName ?? 'serving', amount)}`
}

export function totalsForDate(entries: readonly FoodEntry[], date: DateKey): Macros {
  let calories = 0
  let protein = 0
  for (const e of entries) {
    if (e.date !== date) continue
    calories += e.calories
    protein += e.protein
  }
  return { calories, protein }
}

/**
 * Push a food to the front of the recents, carrying its basis and the amount
 * just used. An existing entry with the same name moves up rather than
 * duplicating; logging something new pushes the least recent off the end.
 */
export function pushRecent(
  recents: readonly RecentFood[],
  entry: FoodEntry,
): RecentFood[] {
  const key = entry.name.trim().toLowerCase()
  const rest = recents.filter((r) => r.name.trim().toLowerCase() !== key)
  const next: RecentFood = {
    name: entry.name,
    portionType: entry.portionType,
    unitName: entry.unitName,
    perCalories: entry.perCalories,
    perProtein: entry.perProtein,
    lastAmount: entry.amount,
    lastLoggedAt: entry.loggedAt,
  }
  return [next, ...rest].slice(0, RECENT_LIMIT)
}
