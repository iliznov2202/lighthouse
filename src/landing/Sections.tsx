import { ArrowRight, Brain, Gamepad2, Globe2, GraduationCap, Palette, Sparkles, Trophy, Users, UserRound } from '../design/icons'
import { Tag } from '../components/ui'
import ActivityCard from '../components/ActivityCard'
import RankingRow from '../components/RankingRow'
import { SiteLink } from './router'
import { Brand } from './Header'

export function Features() {
  const levels = [{ title: 'Ты', caption: 'Твои открытия', icon: UserRound, color: 'purple' }, { title: 'Класс', caption: 'Ваша команда', icon: Users, color: 'blue' }, { title: 'Школа', caption: 'Общая победа', icon: GraduationCap, color: 'mint' }, { title: 'Регион', caption: 'Новый горизонт', icon: Globe2, color: 'pink' }]
  return <section className="ml-section" id="together"><div className="ml-container"><div className="ml-section-heading"><div><span className="eyebrow">ВМЕСТЕ ДАЛЬШЕ</span><h2>Играй не только за себя</h2></div><p>Каждая победа — вклад в твою команду.</p></div>
    <div className="card ml-team-chain">{levels.map(({ title, caption, icon: Icon, color }, index) => <div className="ml-chain-item" key={title}><span className={`feature-icon ${color}`}><Icon aria-hidden="true" /></span><div><h3>{title}</h3><p>{caption}</p></div>{index !== 3 && <ArrowRight className="ml-chain-arrow" aria-hidden="true" />}</div>)}</div>
  </div></section>
}
const activities = [
  { kind: 'Квиз недели', title: 'Насколько хорошо ты знаешь космос?', detail: '10 вопросов · 5 минут', icon: Brain, cta: 'Начать с разминки', badge: 'Знания' },
  { kind: 'Творческий конкурс', title: 'Нарисуй школу будущего', detail: 'Твоя идея. Без границ.', icon: Palette, cta: 'Хочу участвовать', badge: 'Творчество' },
  { kind: 'Мини-игра', title: 'Собери формулу', detail: 'Быстрее мысли, точнее клика', icon: Gamepad2, cta: 'Попробовать', badge: 'Игра' },
]
export function Activities({ onPlay }: { onPlay: () => void }) {
  return <section className="ml-section ml-activities" id="activities"><div className="ml-container"><div className="ml-section-heading"><div><span className="eyebrow">НАЙДИ СВОЁ</span><h2>Каждую неделю что-то новое</h2></div><Tag>Маленькие вызовы. Большие идеи.</Tag></div>
    <div className="ml-activity-grid">{activities.map(({ kind, title, detail, icon: Icon, cta, badge }, index) => <ActivityCard key={kind} className="ml-activity" label={kind} kicker={<><Icon aria-hidden="true" />{kind}</>} badge={<Tag>{badge}</Tag>} title={title} description={detail}>
      <div className="competition-entry-actions">{index === 1 ? <SiteLink to="/register" className="button primary">{cta}<ArrowRight aria-hidden="true" /></SiteLink> : <button className="button primary" onClick={onPlay}>{cta}<ArrowRight aria-hidden="true" /></button>}</div>
    </ActivityCard>)}</div>
  </div></section>
}
// Preview data stays local until a school ranking service is connected.
export const mockSchoolRanking = [{ name: 'Школа №120', city: 'Москва', points: '18 420' }, { name: 'Лицей №7', city: 'Казань', points: '17 950' }, { name: 'Гимназия №3', city: 'Санкт-Петербург', points: '16 810' }]
export function SchoolRanking() {
  return <section className="ml-section ml-ranking"><div className="ml-container ml-ranking-layout"><div className="ml-ranking-copy"><span className="eyebrow">СИЛА КОМАНДЫ</span><h2>Школы соревнуются.<br /><span className="gradient-text">Выигрывают все.</span></h2><p>Кто-то ловко решает квизы. Кто-то придумывает невероятное. Вместе вы можете больше.</p><SiteLink to="/register" className="button primary">Попасть в рейтинг<ArrowRight aria-hidden="true" /></SiteLink></div>
    <div className="card competition-ranking-list ml-ranking-board"><div className="ml-ranking-header"><h3><Trophy aria-hidden="true" />Школьная лига</h3><Tag>Новый сезон</Tag></div><div className="ranking-list-heading"><span>ШКОЛА</span><span>ОЧКИ</span></div>
      {mockSchoolRanking.map((school, index) => <RankingRow key={school.name} position={index + 1} avatar={<span className={`class-avatar ml-school-avatar ml-school-avatar-${index + 1}`}><GraduationCap aria-hidden="true" /></span>} title={school.name} detail={school.city} points={school.points} />)}
      <div className="ml-ranking-you"><span className="feature-icon purple"><Sparkles aria-hidden="true" /></span><div><strong>А где будет твоя школа?</strong><small>История ещё не написана</small></div><SiteLink to="/register" className="icon-button" aria-label="Присоединиться со своей школой"><ArrowRight aria-hidden="true" /></SiteLink></div>
    </div>
  </div></section>
}
export function FinalCallToAction({ completed, onPlay }: { completed: boolean; onPlay: () => void }) {
  return <section className="ml-final-cta" aria-labelledby="final-cta-title"><div className="ml-container"><div className="card ml-final-card"><span className="feature-icon purple"><Sparkles aria-hidden="true" /></span><div><h2 id="final-cta-title">{completed ? 'Твой Маяк уже светит' : 'Твой Маяк ещё не зажжён'}</h2><p>Присоединяйся, участвуй в активностях и помогай своей школе подниматься в рейтинге.</p></div>{completed ? <SiteLink to="/register" className="button primary">Зажечь свой Маяк<ArrowRight aria-hidden="true" /></SiteLink> : <button className="button primary" onClick={onPlay}>Зажечь свой Маяк<ArrowRight aria-hidden="true" /></button>}</div></div></section>
}
export function Footer() {
  return <footer className="ml-footer"><div className="ml-container"><div className="ml-footer-top"><div><Brand /><p>Каждый может быть светом.</p></div><nav aria-label="Информация о проекте"><SiteLink to="/about">О проекте</SiteLink><SiteLink to="/rules">Правила</SiteLink><SiteLink to="/privacy">Политика конфиденциальности</SiteLink><SiteLink to="/terms">Пользовательское соглашение</SiteLink><SiteLink to="/support">Поддержка</SiteLink></nav><SiteLink to="/register" className="text-button ml-footer-cta">Начни свою историю<ArrowRight aria-hidden="true" /></SiteLink></div><div className="ml-footer-bottom"><span>© 2026 Маяк</span><span>Сделано для тех, кто пробует.</span><SiteLink to="/demo">Открыть приложение<ArrowRight aria-hidden="true" /></SiteLink></div></div></footer>
}
