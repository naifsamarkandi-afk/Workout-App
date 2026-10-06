import type { ReactNode } from 'react'

import type { Route } from '../lib/router'
import './BottomNav.css'

interface Props {
  route: Route
  onNavigate: (route: Route) => void
}

const ITEMS: { route: Route; label: string; icon: ReactNode }[] = [
  {
    route: 'home',
    label: 'Home',
    icon: (
      <path d="M3 10.6 12 3l9 7.6V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    route: 'workout',
    label: 'Workout',
    // Redrawn heavier than the original: the old bar was 1 unit tall in a
    // 24-unit box, so it rendered thinner than a pixel and looked weak beside
    // the solid house and cutlery.
    icon: (
      <path d="M2 9.4h1.8v5.2H2zM4.6 7.4h2.8v9.2H4.6zM8.4 10.9h7.2v2.2H8.4zM16.6 7.4h2.8v9.2h-2.8zM20.2 9.4H22v5.2h-1.8z" />
    ),
  },
  {
    route: 'food',
    label: 'Food',
    icon: (
      <path d="M6 2.5h1.6v6.2h1.1V2.5h1.6v6.2h1.1V2.5h1.6V9a3 3 0 0 1-2.3 2.9v9.6H8.3v-9.6A3 3 0 0 1 6 9zM17.4 2.5h1.5c.9 0 1.5.7 1.5 1.6v17.4h-2.2v-7.9h-1.9l.3-9c.1-1.2.4-2.1.8-2.1z" />
    ),
  },
]

export function BottomNav({ route, onNavigate }: Props) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav__bar">
        {ITEMS.map((item) => {
          const active = item.route === route
          return (
            <button
              key={item.route}
              type="button"
              className={`nav__btn${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onNavigate(item.route)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {item.icon}
              </svg>
              <span className="sr-only">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
