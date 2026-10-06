import { useEffect, useMemo, useRef, type CSSProperties } from 'react'

import './Celebration.css'

const DURATION = 1900
const PIECES = 34
const COLORS = ['#F5CF47', '#4AA8EE', '#A7D698', '#E9938A', '#7A5AF8', '#101010']

/** Plays once after a workout is logged, then hands control back. */
export function Celebration({ onDone }: { onDone: () => void }) {
  // Held in a ref so a re-render with a fresh callback doesn't restart the timer.
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    const id = window.setTimeout(() => done.current(), DURATION)
    return () => window.clearTimeout(id)
  }, [])

  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.35}s`,
        duration: `${1 + Math.random() * 0.7}s`,
        drift: `${(Math.random() - 0.5) * 120}px`,
        spin: `${(Math.random() - 0.5) * 720}deg`,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 6,
      })),
    [],
  )

  return (
    <div className="celebrate" role="status" aria-live="polite">
      <div className="celebrate__confetti" aria-hidden="true">
        {pieces.map((p) => (
          <span
            key={p.id}
            style={
              {
                left: p.left,
                background: p.color,
                width: p.size,
                height: p.size * 1.6,
                animationDelay: p.delay,
                animationDuration: p.duration,
                '--drift': p.drift,
                '--spin': p.spin,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <p className="celebrate__text">Workout logged!</p>
    </div>
  )
}
