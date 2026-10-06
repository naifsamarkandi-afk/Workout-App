import { useState } from 'react'

import { Celebration } from '../components/Celebration'
import { CharacterStage } from '../components/CharacterStage'
import { WORKOUTS, bodyLabel } from '../config/workouts'
import { fullDayName } from '../lib/dates'
import { useStore } from '../state/store'
import './WorkoutPage.css'

export function WorkoutPage({ onFinished }: { onFinished: () => void }) {
  const {
    today,
    currentSlot,
    todaySession,
    todayPlan,
    checkedCount,
    setCheckedCount,
    completeWorkout,
  } = useStore()
  const [celebrating, setCelebrating] = useState(false)

  // Two ways the page goes read-only. Once today's session is logged it becomes
  // a record of it; on a rest day there's nothing to do, so the next workout is
  // shown as a faded preview. (A session logged on a rest day turns that day
  // into a workout day, so these two never collide.)
  const completed = todaySession !== null
  const isRestDay = todayPlan?.kind !== 'work'
  const locked = completed || isRestDay

  const slot = todaySession?.slot ?? currentSlot
  const workout = WORKOUTS[slot]
  const exercises = workout.exercises

  const shownChecked = completed || celebrating ? exercises.length : isRestDay ? 0 : checkedCount
  const allDone = checkedCount >= exercises.length

  const handleComplete = () => {
    if (locked || !allDone || celebrating) return
    setCelebrating(true)
    completeWorkout(slot)
  }

  return (
    <div className={`page workout${isRestDay ? ' is-rest' : ''}`}>
      <header className="workout__header">
        <h1 className="workout__day">{fullDayName(today)}</h1>
        <p className="workout__type">{isRestDay ? 'Rest Day' : bodyLabel(workout.body)}</p>
      </header>

      <CharacterStage stage="session" mood="workout" body={workout.body} loop={!locked} />

      {locked && (
        <p className="workout__logged" role="status">
          <span className="workout__logged-tick" aria-hidden="true">
            {isRestDay ? (
              <svg viewBox="0 0 24 24">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M6 12.5 10.5 17 18 8" />
              </svg>
            )}
          </span>
          {isRestDay ? "It's a rest day" : 'Workout logged for today'}
        </p>
      )}

      <ol className={`checklist${locked ? ' is-locked' : ''}`}>
        {exercises.map((ex, i) => {
          const checked = i < shownChecked
          // Sequential: only the next unchecked box, or the last checked one
          // (so a mis-tap can be undone), are pressable.
          const enabled =
            !locked && !celebrating && (i === checkedCount || i === checkedCount - 1)
          // On a rest day nothing is pressable, so every row reads as inactive.
          const cardio = ex.sets === null

          return (
            <li
              key={ex.name}
              className={[
                'row',
                checked ? 'is-checked' : '',
                enabled ? '' : 'is-locked',
                cardio ? 'row--cardio' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className="row__box"
                role="checkbox"
                aria-checked={checked}
                aria-label={ex.name}
                disabled={!enabled}
                onClick={() => setCheckedCount(slot, checked ? i : i + 1)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5 9.5 17 19 7.5" />
                </svg>
              </button>

              <div className="row__text">
                <span className="row__name">{ex.name}</span>
                <span className="row__reps">{cardio ? ex.reps : `${ex.reps} reps`}</span>
              </div>

              {!cardio && (
                <div className="row__sets">
                  <span className="row__sets-n">{ex.sets}</span>
                  <span className="row__sets-l">sets</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        className="workout__done"
        disabled={locked || !allDone}
        onClick={handleComplete}
      >
        {isRestDay ? 'Rest up' : completed ? 'Come back tomorrow' : 'Workout Complete'}
      </button>

      {celebrating && <Celebration onDone={onFinished} />}
    </div>
  )
}
