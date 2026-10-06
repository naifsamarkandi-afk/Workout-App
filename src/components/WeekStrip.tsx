import { HEAD, ZZZ } from '../assets/characters'
import { dayLabel } from '../lib/dates'
import type { DayPlan } from '../lib/schedule'
import './WeekStrip.css'

/**
 * Seven pills, Sunday through Saturday.
 *
 * Dark pill = a workout that was actually completed.
 * Light pill = anything else: today's suggestion, projected days, missed days,
 * and every rest day.
 */
export function WeekStrip({ days }: { days: readonly DayPlan[] }) {
  return (
    <ol className="week" aria-label="This week">
      {days.map((day) => {
        const rest = day.kind === 'rest'
        const icon = rest ? ZZZ : HEAD[day.body ?? 'upper']
        return (
          <li
            key={day.date}
            className={[
              'week__pill',
              day.completed ? 'is-done' : '',
              day.isToday ? 'is-today' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="week__label">{dayLabel(day.date)}</span>
            <img className={`week__icon${rest ? ' is-zzz' : ''}`} src={icon} alt="" aria-hidden="true" />
            <span className="sr-only">
              {rest
                ? 'Rest day'
                : `${day.body === 'upper' ? 'Upper' : 'Lower'} body workout, ${
                    day.completed ? 'complete' : 'not yet complete'
                  }`}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
