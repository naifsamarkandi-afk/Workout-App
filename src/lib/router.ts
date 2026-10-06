import { useEffect, useState } from 'react'

/** Three pages, so a hash router keeps it dependency-free and back-button friendly. */
export type Route = 'home' | 'workout' | 'food'

const PATHS: Record<Route, string> = {
  home: '#/',
  workout: '#/workout',
  food: '#/food',
}

function parse(hash: string): Route {
  if (hash.startsWith('#/workout')) return 'workout'
  if (hash.startsWith('#/food')) return 'food'
  return 'home'
}

export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = (next: Route) => {
    window.location.hash = PATHS[next]
  }

  return [route, navigate]
}
