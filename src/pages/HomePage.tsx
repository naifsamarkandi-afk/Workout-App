import { useEffect, useState } from 'react'

import { CharacterStage } from '../components/CharacterStage'
import { MacroSummary } from '../components/MacroSummary'
import { Typewriter } from '../components/Typewriter'
import { WeekStrip } from '../components/WeekStrip'
import type { BodyPart } from '../config/workouts'
import type { DayPlan } from '../lib/schedule'
import { useStore } from '../state/store'
import './HomePage.css'

const GREETING = 'Welcome back Naif!'
const SPEED = 45

/**
 * The intro types itself out once when the app opens. Coming back to the
 * homepage from another tab shouldn't replay it, so the flag lives outside
 * React and only resets on a full reload.
 */
let introPlayed = false

export function HomePage() {
  const { week, todayPlan, characterBody, workoutsThisWeek, workoutsGoal, eatenToday } = useStore()

  const isRest = todayPlan?.kind !== 'work'
  const body: BodyPart = characterBody

  // Read the flag once at mount and set it from an effect. Setting it during
  // render instead meant StrictMode's double render saw it already true on the
  // second pass, so the intro never actually animated.
  const [instant] = useState(() => introPlayed)
  useEffect(() => {
    introPlayed = true
  }, [])

  return (
    <div className="page home">
      <h1 className="home__greeting">
        <Typewriter text={GREETING} speed={SPEED} instant={instant} />
        <Typewriter
          as="p"
          className="home__sub"
          text={subline(todayPlan, body)}
          speed={22}
          // Starts as the greeting finishes, with a short beat in between.
          startAt={GREETING.length * SPEED + 260}
          instant={instant}
        />
      </h1>

      <CharacterStage stage="home" mood={isRest ? 'rest' : 'workout'} body={body} />

      <WeekStrip days={week} />

      <p className="home__progress">
        <span className="home__progress-mark" aria-hidden="true" />
        {Math.min(workoutsThisWeek, workoutsGoal)} of {workoutsGoal} workouts complete
      </p>

      <MacroSummary eaten={eatenToday} />
    </div>
  )
}

function subline(plan: DayPlan | null, body: BodyPart): string {
  if (!plan || plan.kind === 'rest') return "Today's a rest day — take it easy."

  const label = body === 'upper' ? 'Upper body' : 'Lower body'
  if (plan.completed) return `${label} day done — nice work.`

  const article = body === 'upper' ? 'an' : 'a'
  return `Today's ${article} ${label.toLowerCase()} day.`
}
