/**
 * The four rotation slots. The app cycles these automatically:
 *   Upper A -> Lower A -> Upper B -> Lower B -> repeat
 *
 * The slot id is internal. The UI only ever shows "Upper Body" / "Lower Body"
 * plus the matching character.
 */

export type SlotId = 'UPPER_A' | 'LOWER_A' | 'UPPER_B' | 'LOWER_B'
export type BodyPart = 'upper' | 'lower'

export interface Exercise {
  name: string
  /** Sets, or null for cardio which has no set count. */
  sets: number | null
  reps: string
}

export interface WorkoutSlot {
  id: SlotId
  body: BodyPart
  /** Internal only — never rendered. Kept for debugging and future stats. */
  focus: string
  exercises: Exercise[]
}

/** Rotation order. Index arithmetic elsewhere depends on this exact order. */
export const ROTATION: readonly SlotId[] = ['UPPER_A', 'LOWER_A', 'UPPER_B', 'LOWER_B'] as const

const CARDIO: Exercise = { name: 'Cardio', sets: null, reps: '15–20 min' }

export const WORKOUTS: Record<SlotId, WorkoutSlot> = {
  UPPER_A: {
    id: 'UPPER_A',
    body: 'upper',
    focus: 'chest, shoulders, triceps',
    exercises: [
      { name: 'Dumbbell bench press (flat)', sets: 4, reps: '8–10' },
      { name: 'Dumbbell incline press', sets: 3, reps: '10–12' },
      { name: 'Dumbbell shoulder press', sets: 3, reps: '10–12' },
      { name: 'Dumbbell lateral raise', sets: 3, reps: '12–15' },
      { name: 'Dumbbell overhead triceps extension', sets: 3, reps: '10–12' },
      { name: 'Dumbbell triceps kickback', sets: 2, reps: '12–15' },
      CARDIO,
    ],
  },
  LOWER_A: {
    id: 'LOWER_A',
    body: 'lower',
    focus: 'quad focus',
    exercises: [
      { name: 'Dumbbell goblet squat', sets: 4, reps: '10–12' },
      { name: 'Dumbbell Bulgarian split squat', sets: 3, reps: '10–12 each leg' },
      { name: 'Dumbbell walking lunge', sets: 3, reps: '12 each leg' },
      { name: 'Dumbbell step-up', sets: 3, reps: '10–12 each leg' },
      { name: 'Dumbbell calf raise', sets: 4, reps: '15–20' },
      { name: 'Plank', sets: 3, reps: '30–45s hold' },
      CARDIO,
    ],
  },
  UPPER_B: {
    id: 'UPPER_B',
    body: 'upper',
    focus: 'back, biceps',
    exercises: [
      { name: 'Dumbbell row (single-arm, supported)', sets: 4, reps: '8–10 each side' },
      { name: 'Dumbbell pullover', sets: 3, reps: '10–12' },
      { name: 'Dumbbell reverse fly', sets: 3, reps: '12–15' },
      { name: 'Dumbbell shrug', sets: 3, reps: '12–15' },
      { name: 'Dumbbell biceps curl', sets: 3, reps: '10–12' },
      { name: 'Dumbbell hammer curl', sets: 2, reps: '12–15' },
      CARDIO,
    ],
  },
  LOWER_B: {
    id: 'LOWER_B',
    body: 'lower',
    focus: 'hamstrings, glutes',
    exercises: [
      { name: 'Dumbbell Romanian deadlift', sets: 4, reps: '10–12' },
      { name: 'Dumbbell single-leg deadlift', sets: 3, reps: '8–10 each leg' },
      { name: 'Dumbbell hip thrust', sets: 3, reps: '12–15' },
      { name: 'Dumbbell sumo squat', sets: 3, reps: '12–15' },
      { name: 'Dumbbell calf raise', sets: 3, reps: '15–20' },
      { name: 'Side plank', sets: 3, reps: '30s each side' },
      CARDIO,
    ],
  },
}

/** "Upper Body" / "Lower Body" — what the user actually sees. */
export function bodyLabel(body: BodyPart): string {
  return body === 'upper' ? 'Upper Body' : 'Lower Body'
}

export function slotBody(slot: SlotId): BodyPart {
  return WORKOUTS[slot].body
}
