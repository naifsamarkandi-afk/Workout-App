import { useEffect, useState } from 'react'

import './Typewriter.css'

/**
 * Types text out one character at a time.
 *
 * `startAt` delays the run so a second line can wait for the first to finish.
 * The full string is always in the DOM (visually hidden) so the element
 * reserves its final height from the first frame — otherwise the page below
 * would jump as the text grows.
 */
interface Props {
  text: string
  /** Ms per character. */
  speed?: number
  /** Ms to wait before starting. */
  startAt?: number
  /** Skip the animation and render the text immediately. */
  instant?: boolean
  className?: string
  as?: 'span' | 'p'
}

export function Typewriter({
  text,
  speed = 45,
  startAt = 0,
  instant = false,
  className = '',
  as: Tag = 'span',
}: Props) {
  const skip = instant || prefersReducedMotion()
  const [count, setCount] = useState(() => (skip ? text.length : 0))

  useEffect(() => {
    if (skip) {
      setCount(text.length)
      return
    }

    setCount(0)
    let tick: number | undefined
    const begin = window.setTimeout(() => {
      let i = 0
      tick = window.setInterval(() => {
        i += 1
        setCount(i)
        if (i >= text.length && tick !== undefined) window.clearInterval(tick)
      }, speed)
    }, startAt)

    return () => {
      window.clearTimeout(begin)
      if (tick !== undefined) window.clearInterval(tick)
    }
  }, [text, speed, startAt, skip])

  const done = count >= text.length

  return (
    <Tag className={`type ${className}`.trim()}>
      {/* Reserves the final size; never read aloud twice. */}
      <span className="type__ghost" aria-hidden="true">
        {text}
      </span>
      <span className="type__visible">
        {text.slice(0, count)}
        {!done && <span className="type__caret" aria-hidden="true" />}
      </span>
    </Tag>
  )
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}
