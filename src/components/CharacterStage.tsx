import type { BodyPart } from '../config/workouts'
import { characterArt, type Mood, type Stage } from '../assets/characters'
import './CharacterStage.css'

interface Props {
  stage: Stage
  mood: Mood
  body: BodyPart
  /**
   * The workout screen plays its artwork on its own, with no CSS motion layered
   * over the top. The homepage adds a gentle idle float.
   */
  loop?: boolean
}

export function CharacterStage({ stage, mood, body, loop = false }: Props) {
  const src = characterArt(stage, mood, body)
  const label =
    mood === 'rest'
      ? `${body === 'upper' ? 'Upper' : 'Lower'} body character resting`
      : `${body === 'upper' ? 'Upper' : 'Lower'} body character working out`

  return (
    <div className="stage card">
      <img
        className={`stage__art${loop ? '' : ' is-idle'}`}
        // Remount on change so a swapped-in GIF restarts from frame one.
        key={src}
        src={src}
        alt={label}
        draggable={false}
      />
    </div>
  )
}
