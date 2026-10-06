/**
 * Local-date helpers. Everything in the app keys off a "YYYY-MM-DD" string in
 * the user's own timezone — never a UTC ISO timestamp, so a late-night workout
 * doesn't land on tomorrow.
 */

export type DateKey = string // 'YYYY-MM-DD'

export function toKey(d: Date): DateKey {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(): DateKey {
  return toKey(new Date())
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000)
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayIndex(key: DateKey): number {
  return fromKey(key).getDay()
}

/** The Sunday of the calendar week containing `key`. */
export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, -weekdayIndex(key))
}

/** The Saturday of the calendar week containing `key`. */
export function endOfWeek(key: DateKey): DateKey {
  return addDays(startOfWeek(key), 6)
}

export const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export function dayLabel(key: DateKey): string {
  return DAY_LABELS[weekdayIndex(key)]
}

export function fullDayName(key: DateKey): string {
  return FULL_DAY_NAMES[weekdayIndex(key)]
}
