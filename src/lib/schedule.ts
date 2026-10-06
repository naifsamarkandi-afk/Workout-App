/**
 * Schedule projection — the core of the app.
 *
 * The schedule is derived from what was actually logged, never from fixed
 * weekdays. We walk day by day from the first ever logged session and carry two
 * cursors:
 *
 *   patternCursor — position in the 7-day shape  W W R W W R R  (4 on, 3 off)
 *   rotationIndex — position in  Upper A -> Lower A -> Upper B -> Lower B
 *
 * Both advance only when a workout day is actually completed (or, for days that
 * haven't happened yet, when we optimistically project one). A skipped workout
 * day leaves both cursors where they are, so the whole plan just slides forward
 * by a day. Nothing resets.
 *
 * Because both cursors step together, the two workout days in a pair are always
 * one upper and one lower.
 */

import { ROTATION, type SlotId, slotBody, type BodyPart } from '../config/workouts'
import { addDays, daysBetween, type DateKey } from './dates'

export type DayKind = 'work' | 'rest'

/** A completed workout, as stored. */
export interface Session {
  date: DateKey
  slot: SlotId
  /** Local timestamp of completion, for future stats. */
  completedAt: string
}

export interface DayPlan {
  date: DateKey
  kind: DayKind
  /** The rotation slot for a workout day. null on rest days. */
  slot: SlotId | null
  body: BodyPart | null
  /** True only when a session was logged on this date. Drives the dark pill. */
  completed: boolean
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

/**
 * The cycle, one entry per position: Upper A, Lower A, rest, Upper B, Lower B,
 * rest, rest — then repeat. null means a rest day.
 *
 * The workout is bound to the position rather than tracked separately, so the
 * two days of a pair are always one upper and one lower by construction.
 */
export const CYCLE: readonly (SlotId | null)[] = [
  'UPPER_A',
  'LOWER_A',
  null,
  'UPPER_B',
  'LOWER_B',
  null,
  null,
] as const

/** Kept for anything that only cares about work-vs-rest shape. */
export const WEEK_PATTERN: readonly DayKind[] = CYCLE.map((s) => (s ? 'work' : 'rest'))

/**
 * Build the plan for every day in [from, to].
 *
 * The cycle advances one position per day, except on a workout day you didn't
 * log: that holds the position, so the workout you missed becomes the next
 * day's workout and everything after it shifts along. Nothing resets.
 *
 * Days before your first ever session are laid out by wrapping the cycle
 * backwards — there was nothing to miss back then, so they never hold it up.
 */
export function buildSchedule(
  sessions: readonly Session[],
  today: DateKey,
  from: DateKey,
  to: DateKey,
): DayPlan[] {
  const byDate = new Map<DateKey, Session>()
  for (const s of sessions) byDate.set(s.date, s)

  const anchor = sessions.length
    ? sessions.reduce((min, s) => (s.date < min ? s.date : min), sessions[0].date)
    : today

  // Walk from whichever comes first so the cursor is correct by the time we
  // reach the window the caller asked for.
  const start = anchor < from ? anchor : from

  const out: DayPlan[] = []
  let cursor = 0

  for (let d = start; d <= to; d = addDays(d, 1)) {
    // Before the anchor there is no history to hold the cycle up, so the
    // position is pure date arithmetic. From the anchor on, it's the cursor.
    const position = d < anchor ? mod(daysBetween(anchor, d), CYCLE.length) : cursor
    const planned = CYCLE[position]
    const session = byDate.get(d)

    // A logged workout always wins — including one done on a projected rest day.
    const kind: DayKind = session || planned ? 'work' : 'rest'
    const slot: SlotId | null = session?.slot ?? planned
    const completed = session !== undefined

    if (d >= anchor) {
      if (session || !planned) {
        // Workout done, or a rest day taken: the cycle moves on.
        cursor = (cursor + 1) % CYCLE.length
      } else if (d >= today) {
        // Today and later are projected as "will be done" so the plan ahead
        // reads correctly. A past workout day with nothing logged holds the
        // position, which is what slides the missed workout onto the next day.
        cursor = (cursor + 1) % CYCLE.length
      }
    }

    if (d >= from) {
      out.push({
        date: d,
        kind,
        slot,
        body: slot ? slotBody(slot) : null,
        completed,
        isToday: d === today,
        isPast: d < today,
        isFuture: d > today,
      })
    }
  }

  return out
}

/** True modulo — JS's % keeps the sign, which breaks dates before the anchor. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

/** The next workout day that hasn't been done yet, today included. */
export function nextWorkout(plans: readonly DayPlan[], today: DateKey): DayPlan | null {
  return plans.find((p) => p.kind === 'work' && !p.completed && p.date >= today) ?? null
}

/**
 * Which workout the workout page should show right now.
 *
 * On a workout day that's the day's own slot. On a rest day it's the next one
 * up, because the workout page stays usable every day — logging on a rest day
 * simply shifts the projection forward.
 */
export function activeSlot(plans: readonly DayPlan[], today: DateKey): SlotId {
  // The first workout still outstanding. On a normal workout day that's today's
  // own slot; on a rest day, or once today's session is already logged, it rolls
  // on to the next one so you can never re-log a workout you've just finished.
  const next = nextWorkout(plans, today)
  if (next?.slot) return next.slot

  const todayPlan = plans.find((p) => p.date === today)
  return todayPlan?.slot ?? ROTATION[0]
}

/** Workouts logged inside the given calendar week. */
export function workoutsInWeek(
  sessions: readonly Session[],
  weekStart: DateKey,
  weekEnd: DateKey,
): number {
  return sessions.filter((s) => s.date >= weekStart && s.date <= weekEnd).length
}
