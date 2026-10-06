import './MacroRing.css'

interface Props {
  /** 0–1 of the calorie goal consumed. */
  calories: number
  /** 0–1 of the protein goal consumed. */
  protein: number
}

const SIZE = 132
const CENTER = SIZE / 2
const OUTER_R = 54
const INNER_R = 39
const STROKE = 13

/**
 * Two concentric arcs: the outer one is calories, the inner one protein.
 * Both fill clockwise from the top and go solid when the goal is met.
 *
 * The mockup left this as a blank circle, so this is a working stand-in —
 * restyle freely, the maths lives entirely in here.
 */
export function MacroRing({ calories, protein }: Props) {
  const done = calories >= 1 && protein >= 1
  return (
    <div className={`ring${done ? ' is-complete' : ''}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img"
        aria-label={`${Math.round(calories * 100)}% of calories and ${Math.round(
          protein * 100,
        )}% of protein reached today`}>
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          <Arc r={OUTER_R} pct={1} className="ring__track" />
          <Arc r={INNER_R} pct={1} className="ring__track" />
          <Arc r={OUTER_R} pct={calories} className="ring__cal" />
          <Arc r={INNER_R} pct={protein} className="ring__pro" />
        </g>
      </svg>
    </div>
  )
}

function Arc({ r, pct, className }: { r: number; pct: number; className: string }) {
  const circumference = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, pct))
  return (
    <circle
      className={className}
      cx={CENTER}
      cy={CENTER}
      r={r}
      fill="none"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={circumference * (1 - clamped)}
    />
  )
}
