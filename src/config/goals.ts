/**
 * Daily nutrition targets. Change them here and the whole app follows —
 * homepage numbers, the ring, and the "goal met" checks.
 *
 * Midpoints of the plan document's ranges:
 *   calories 3,000–3,200  ->  3,100
 *   protein    155–170 g  ->    160 g
 */
export const DAILY_GOALS = {
  calories: 3100,
  protein: 160,
} as const

/** Workout days per week, used by the "X of 4 workouts complete" line. */
export const WORKOUTS_PER_WEEK = 4
