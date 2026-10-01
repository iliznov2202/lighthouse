import { useEffect, useRef, type PointerEvent } from 'react'
import { ArrowDown, ArrowRight, Sparkles } from '../design/icons'
import Lighthouse from './Lighthouse'
import MiniGame from './MiniGame'
import type { MiniGameController } from './useMiniGame'

export default function Hero({ game }: { game: MiniGameController }) {
  const scene = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (game.phase !== 'initial') document.getElementById('lighthouse-hero')?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [game.phase])
  function parallax(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    scene.current?.style.setProperty('--drift-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 12}px`)
    scene.current?.style.setProperty('--drift-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`)
  }
  function start() { game.dispatch({ type: 'start' }); document.getElementById('lighthouse-hero')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }) }
  return <section className={`ml-hero ml-phase-${game.phase}`} id="lighthouse-hero" onPointerMove={parallax} onPointerLeave={() => { scene.current?.style.setProperty('--drift-x', '0px'); scene.current?.style.setProperty('--drift-y', '0px') }}>
    <div className="ml-container ml-hero-content">
      {game.phase === 'initial' ? <div className="ml-hero-copy"><span className="eyebrow">НА ОДНОЙ ВОЛНЕ</span><h1>Зажги свой<br /><span className="gradient-text">Маяк.</span></h1><p>Играй. Создавай.<br />Приноси очки своей школе.</p><button className="button primary ml-start" onClick={start}>Зажечь маяк<Sparkles aria-hidden="true" /></button><div className="ml-hero-note"><Sparkles aria-hidden="true" />3 маленьких задания. Один большой старт.</div></div> : <MiniGame game={game} />}
      <div className="ml-hero-art" ref={scene}><Lighthouse sparks={game.sparks} /><div className="ml-scene-caption"><span className="ml-scene-live" /><span>{game.phase === 'initial' ? 'Каждый маяк начинается с тебя' : game.phase === 'completed' ? 'Твой свет уже виден' : 'Чтобы включить маяк, собери 3 искры'}</span></div>{game.sparks > 0 && <div className="ml-island-badge" key={game.sparks}><Sparkles size={15} aria-hidden="true" />{game.sparks === 3 ? 'Свет на полную' : `+1 искра · ${game.sparks}/3`}</div>}</div>
    </div><div className="ml-container ml-hero-bottom"><a className="ml-scroll-link text-button" href="#together">Узнать, что за горизонтом<ArrowDown aria-hidden="true" /></a><span className="ml-hero-coordinates">ТВОЯ ТОЧКА СТАРТА</span>{game.phase !== 'initial' && <button className="text-button ml-exit-game" onClick={() => game.dispatch({ type: 'reset' })}>Начать заново<ArrowRight aria-hidden="true" /></button>}</div>
  </section>
}
