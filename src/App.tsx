import { BottomNav } from './components/BottomNav'
import { useRoute } from './lib/router'
import { FoodPage } from './pages/FoodPage'
import { HomePage } from './pages/HomePage'
import { WorkoutPage } from './pages/WorkoutPage'
import { StoreProvider } from './state/store'

function Pages() {
  const [route, navigate] = useRoute()

  return (
    <div className="phone">
      {route === 'home' && <HomePage />}
      {route === 'workout' && <WorkoutPage onFinished={() => navigate('home')} />}
      {route === 'food' && <FoodPage />}
      <BottomNav route={route} onNavigate={navigate} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Pages />
    </StoreProvider>
  )
}
