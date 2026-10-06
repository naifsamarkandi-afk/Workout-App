/**
 * Character art.
 *
 * Six animation slots plus the two heads and the zzz mark for the week strip.
 * Yellow character = lower body, blue character = upper body.
 *
 * To swap any of these, replace the file — nothing else in the app changes.
 */

import type { BodyPart } from '../../config/workouts'

import lowerHomeRest from './lower-home-rest.webp'
import lowerHomeWorkout from './lower-home-workout.webp'
import lowerSession from './lower-session.webp'
import upperHomeRest from './upper-home-rest.webp'
import upperHomeWorkout from './upper-home-workout.webp'
import upperSession from './upper-session.webp'

import lowerHead from './lower-head.png'
import upperHead from './upper-head.png'
import zzz from './zzz.png'

/** Where the art is being shown. */
export type Stage = 'home' | 'session'
/** What kind of day it is. */
export type Mood = 'workout' | 'rest'

const ART: Record<Stage, Record<Mood, Record<BodyPart, string>>> = {
  home: {
    workout: { upper: upperHomeWorkout, lower: lowerHomeWorkout },
    rest: { upper: upperHomeRest, lower: lowerHomeRest },
  },
  session: {
    // The workout screen only ever shows the workout-day loop.
    workout: { upper: upperSession, lower: lowerSession },
    rest: { upper: upperSession, lower: lowerSession },
  },
}

export function characterArt(stage: Stage, mood: Mood, body: BodyPart): string {
  return ART[stage][mood][body]
}

export const HEAD: Record<BodyPart, string> = { upper: upperHead, lower: lowerHead }

export const ZZZ = zzz
