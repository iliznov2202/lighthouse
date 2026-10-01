import { lazy, Suspense, useEffect, useState } from 'react'
import Header from './Header'
import Hero from './Hero'
import { Activities, Features, Footer, SchoolRanking, FinalCallToAction } from './Sections'
import InfoPage from './InfoPage'
import { currentRoute, NavigationContext, routeHref } from './router'
import { useMiniGame } from './useMiniGame'
import { AppErrorBoundary, AppLoading } from '../components/AppLoading'

const DemoApp = lazy(() => import('./DemoApp'))
const titles: Record<string, string> = { '/': 'Зажги свой Маяк', '/register': 'Регистрация', '/login': 'Вход', '/about': 'О проекте', '/rules': 'Правила', '/privacy': 'Конфиденциальность', '/terms': 'Условия использования', '/support': 'Поддержка', '/demo': 'Демо приложения' }
export default function SiteApp() {
  const [path, setPath] = useState(currentRoute)
  const game = useMiniGame()
  useEffect(() => { const listener = () => setPath(currentRoute()); window.addEventListener('popstate', listener); return () => window.removeEventListener('popstate', listener) }, [])
  useEffect(() => {
    document.title = `${titles[path] ?? 'Страница не найдена'} · Маяк`
    document.documentElement.dataset.surface = ['/demo', '/register', '/login'].includes(path) ? 'demo' : 'landing'
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('site-main')?.focus({ preventScroll: true })
  }, [path])
  function navigate(next: string) { if (next === path) { window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); return }; window.history.pushState({}, '', routeHref(next)); setPath(next) }
  function play() { if (game.phase !== 'completed') game.dispatch({ type: 'start' }); document.getElementById('lighthouse-hero')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }) }
  if (['/demo', '/register', '/login'].includes(path)) return <AppErrorBoundary><Suspense fallback={<AppLoading />}><DemoApp authRoute={path !== '/demo'} initialAuthView={path === '/login' ? 'login' : 'account'} introReward={path === '/register' && game.phase === 'completed'} onAuthenticated={() => navigate('/demo')} onHome={() => navigate('/')} /></Suspense></AppErrorBoundary>
  return <NavigationContext.Provider value={navigate}><div className={`mayak-site ${path === '/' ? 'ml-home' : 'ml-inner-page'}`}><a className="ml-skip" href="#site-main">К содержимому</a><Header /><div id="site-main" tabIndex={-1}>{path === '/' ? <main><Hero game={game} /><Features /><Activities onPlay={play} /><SchoolRanking /><FinalCallToAction completed={game.phase === 'completed'} onPlay={play} /></main> : <InfoPage path={path} />}</div><Footer /></div></NavigationContext.Provider>
}
