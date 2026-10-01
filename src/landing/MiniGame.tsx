import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Gamepad2, Palette, RotateCcw, Sparkles, Star, Trophy, Brain } from '../design/icons'
import { Avatar, Tag } from '../components/ui'
import { SiteLink } from './router'
import type { Interest, MiniGameController } from './useMiniGame'

export function GameProgress({ sparks }: { sparks: number }) {
  return <div className="ml-progress" role="progressbar" aria-label={`${sparks} / 3 искры`} aria-valuemin={0} aria-valuemax={3} aria-valuenow={sparks}>
    <div aria-hidden="true">{[1, 2, 3].map(index => <span key={index} className={sparks >= index ? 'is-lit' : ''}>{sparks >= index ? <Check /> : <span />}</span>)}</div>
    <span><strong>{sparks}</strong> / 3 искры</span>
  </div>
}
export function QuizGame({ game }: { game: MiniGameController }) {
  const correct = game.answer === 'Марс'
  return <><div className="ml-task-label"><span className="eyebrow">01 / КВИЗ</span><Brain aria-hidden="true" /></div>
    <h2 tabIndex={-1}>Какую планету<br />называют Красной?</h2><p className="ml-task-description">Начнём с маленького открытия.</p>
    <div className="quiz-answer-options ml-quiz-options">{['Марс', 'Венера', 'Юпитер', 'Нептун'].map((answer, index) => <button key={answer} className={game.answer === answer ? correct ? 'is-correct' : 'is-wrong' : ''} disabled={correct} aria-pressed={game.answer === answer} onClick={() => game.dispatch({ type: 'answer', answer })}><span>{['А', 'Б', 'В', 'Г'][index]}</span><strong>{answer}</strong>{game.answer === answer && correct && <Check aria-hidden="true" />}</button>)}</div>
    <p className={`ml-feedback ${correct ? 'is-positive' : ''}`} role="status">{game.answer ? correct ? 'Точно! Первая искра твоя.' : 'Почти. Красный цвет ей придаёт железо — попробуй ещё!' : 'Выбери один ответ. Ошибаться можно.'}</p>
  </>
}
const randomPosition = () => ({ x: 15 + Math.random() * 70, y: 18 + Math.random() * 64 })
export function StarGame({ game }: { game: MiniGameController }) {
  const [position, setPosition] = useState(randomPosition)
  const [burst, setBurst] = useState(false)
  const lock = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function catchStar() {
    if (lock.current || game.caught >= 3) return
    lock.current = true; setBurst(true); game.dispatch({ type: 'catch' })
    timer.current = setTimeout(() => { setPosition(randomPosition()); setBurst(false); lock.current = false }, 220)
  }
  return <><div className="ml-task-label"><span className="eyebrow">02 / РЕАКЦИЯ</span><Gamepad2 aria-hidden="true" /></div>
    <h2 tabIndex={-1}>Поймай 3 звезды</h2><div className="ml-star-instructions"><p className="ml-task-description">Нажимай на звезду, пока она рядом.</p><span className="ml-star-count" aria-live="polite">{game.caught} / 3</span></div>
    <div className="ml-star-arena"><div className="ml-star-grid" aria-hidden="true" />
      {(game.caught < 3 || burst) && <button type="button" className={`ml-catch-star ${burst ? 'is-caught' : ''}`} style={{ left: `clamp(40px, ${position.x}%, calc(100% - 40px))`, top: `clamp(40px, ${position.y}%, calc(100% - 40px))` }} onClick={catchStar} aria-disabled={burst} aria-label={`Поймать звезду ${Math.min(game.caught + 1, 3)}`}><Star aria-hidden="true" /></button>}
      {burst && <span className="ml-star-burst" aria-hidden="true" style={{ left: `${position.x}%`, top: `${position.y}%` }}>+1</span>}
      {game.caught === 3 && !burst && <div className="ml-arena-success"><Check aria-hidden="true" /><strong>Все звёзды собраны</strong></div>}
    </div><p className="ml-feedback is-positive" role="status">{game.caught === 3 ? 'Вторая искра зажглась. Осталось совсем немного!' : 'Без таймера. В своём ритме.'}</p>
  </>
}
export const interestOptions = [{ id: 'quizzes' as const, label: 'Квизы', icon: Brain, hint: 'Узнавать новое' }, { id: 'creativity' as const, label: 'Творчество', icon: Palette, hint: 'Выражать себя' }, { id: 'games' as const, label: 'Игры', icon: Gamepad2, hint: 'Ловить момент' }, { id: 'competitions' as const, label: 'Конкурсы', icon: Trophy, hint: 'Пробовать силы' }]
export function InterestGame({ game }: { game: MiniGameController }) {
  return <><div className="ml-task-label"><span className="eyebrow">03 / ТВОЙ ВЫБОР</span><Sparkles aria-hidden="true" /></div><h2 tabIndex={-1}>Что зажигает твой интерес?</h2><p className="ml-task-description">Выбери одно или несколько направлений.</p>
    <div className="ml-interest-options">{interestOptions.map(({ id, label, icon: Icon, hint }) => <button key={id} aria-pressed={game.interests.includes(id)} onClick={() => game.dispatch({ type: 'interest', interest: id as Interest })}><span className="feature-icon purple"><Icon aria-hidden="true" /></span><span><strong>{label}</strong><small>{hint}</small></span><span className="ml-choice-check" aria-hidden="true">{game.interests.includes(id) && <Check />}</span></button>)}</div>
    <button className="button primary full" disabled={!game.interests.length} onClick={() => game.dispatch({ type: 'finish' })}>Готово<ArrowRight aria-hidden="true" /></button>
  </>
}
export function GameComplete({ onReset }: { onReset: () => void }) {
  return <><div className="ml-task-label"><span className="eyebrow">ПЕРВОЕ ДОСТИЖЕНИЕ</span><Sparkles aria-hidden="true" /></div><h2 tabIndex={-1}>Маяк зажжён!</h2>
    <div className="ml-earned"><strong>+30</strong><span>очков</span></div>
    <div className="card ml-profile-preview" aria-label="Твой первый результат"><Avatar /><div><strong>Твой Маяк</strong><span>30 очков · первая искра</span></div><Tag>Новичок</Tag></div>
    <p className="ml-complete-copy">Хорошее начало. Создай профиль — впереди открытия и общие победы твоей команды.</p>
    <SiteLink to="/register" className="button primary full">Создать профиль<ArrowRight aria-hidden="true" /></SiteLink>
    <SiteLink to="/login" className="button secondary full ml-complete-login">У меня уже есть аккаунт</SiteLink>
    <button className="text-button ml-replay" onClick={onReset} aria-label="Пройти разминку заново"><RotateCcw aria-hidden="true" />Пройти ещё раз</button>
  </>
}
export default function MiniGame({ game }: { game: MiniGameController }) {
  const panel = useRef<HTMLDivElement>(null)
  const [visiblePhase, setVisiblePhase] = useState(game.phase)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (visiblePhase === game.phase) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setLeaving(true)
    const timer = window.setTimeout(() => { setVisiblePhase(game.phase); setLeaving(false) }, reduced ? 0 : 150)
    return () => window.clearTimeout(timer)
  }, [game.phase, visiblePhase])
  useEffect(() => { panel.current?.querySelector<HTMLHeadingElement>('h2')?.focus({ preventScroll: true }) }, [visiblePhase])
  return <div className={`ml-game-panel ml-game-${visiblePhase}`} ref={panel}><div className="ml-game-top"><span className="eyebrow">ТВОЯ ПЕРВАЯ ИСКРА</span><GameProgress sparks={game.sparks} /></div>
    <div className={`card ml-game-card ${leaving ? 'ml-task-leaving' : ''}`} key={visiblePhase} inert={leaving} aria-busy={leaving}>
      {visiblePhase === 'quiz' && <QuizGame game={game} />}{visiblePhase === 'stars' && <StarGame game={game} />}{visiblePhase === 'interests' && <InterestGame game={game} />}{visiblePhase === 'completed' && <GameComplete onReset={() => game.dispatch({ type: 'reset' })} />}
    </div>
  </div>
}
