import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Bell, BookOpen, Bookmark, ChevronDown, ChevronRight, GraduationCap, Heart, LayoutGrid, MapPin, Plus, Sparkles, UserRound, Users } from 'lucide-react'
import { defaultProfile, initialHomework, initialNotices, initialPosts, initialSchedule, socialDemoPosts } from './data/mock'
import { CompetitionCard, CompetitionScreen } from './features/competition/Competition'
import { useCompetition } from './features/competition/useCompetition'
import { knowledgeQuiz, weeklyCompetition, initialClassRankings, finalClassRankings, initialStudentRankings, competitionNoticePost } from './features/competition/mock'
import { applyClassContribution, completionPost, rankClasses } from './features/competition/logic'
import type { CompetitionView, CompetitionPhase } from './features/competition/types'
import type { Homework, Lesson, Notice, Post, Profile, Scope, StudyTab, Tab } from './types'
import { useStoredState } from './hooks/useStoredState'
import Onboarding from './components/Onboarding'
import Feed from './components/Feed'
import Study, { Digest } from './components/Study'
import { Notifications, ProfilePage } from './components/Personal'
import { CreateMenu, HomeworkComposer, PostComposer, ScheduleImport } from './components/Composer'
import { Avatar, Brand, DemoLabel, LighthouseLoader, Modal, PicnicArt, SubjectIcon, Tag, Toast } from './components/ui'

type Composer = 'menu' | 'post' | 'poll' | 'homework' | 'schedule' | null
const navItems = [{ id: 'feed' as const, label: 'Лента', icon: LayoutGrid }, { id: 'study' as const, label: 'Учёба', icon: BookOpen }, { id: 'notifications' as const, label: 'Уведомления', icon: Bell }, { id: 'profile' as const, label: 'Профиль', icon: UserRound }]
export default function App() {
  const [starting, setStarting] = useState(true)
  const [replaying, setReplaying] = useState(false)
  useEffect(() => {
    if (!replaying) return
    const timer = window.setTimeout(() => setReplaying(false), 7400)
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setReplaying(false) }
    window.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKey) }
  }, [replaying])
  useEffect(() => {
    const timer = window.setTimeout(() => setStarting(false), 4200)
    return () => window.clearTimeout(timer)
  }, [])
  const [onboarded, setOnboarded] = useStoredState('mayak-onboarded-v1', false)
  const [profile, setProfile] = useStoredState<Profile>('mayak-profile-v1', defaultProfile)
  const [posts, setPosts] = useStoredState<Post[]>('mayak-posts-v1', initialPosts)
  const [homework, setHomework] = useStoredState<Homework[]>('mayak-homework-v1', initialHomework)
  const [schedule, setSchedule] = useStoredState<Lesson[][]>('mayak-schedule-v1', initialSchedule)
  const [notices, setNotices] = useStoredState<Notice[]>('mayak-notices-v1', initialNotices)
  const [socialVersion, setSocialVersion] = useStoredState('mayak-social-version', 0)
  const competition = useCompetition(knowledgeQuiz, weeklyCompetition, profile, initialClassRankings, finalClassRankings, initialStudentRankings)
  const [competitionView, setCompetitionView] = useState<CompetitionView>(null)
  const scrollPositions = useRef<Record<Tab, number>>({ feed: 0, study: 0, notifications: 0, profile: 0 })
  const [tab, setTab] = useState<Tab>('feed')
  const [studyTab, setStudyTab] = useState<StudyTab>('today')
  const [composer, setComposer] = useState<Composer>(null)
  const [digest, setDigest] = useState<'morning' | 'evening' | null>(null)
  const [savedOnly, setSavedOnly] = useState(false)
  const [community, setCommunity] = useState(false)
  const [event, setEvent] = useState(false)
  const [eventJoined, setEventJoined] = useStoredState('mayak-event-v1', false)
  const [commentsId, setCommentsId] = useState<string | null>(null)
  const [requestedScope, setRequestedScope] = useState<Scope | null>(null)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unread = notices.filter(n => !n.read).length
  const savedCount = posts.filter(p => p.saved).length
  const pending = homework.filter(h => !h.done && h.date === '2026-10-01')
  function notify(message: string) { if (toastTimer.current) clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 3600) }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])
  useEffect(() => {
    if (socialVersion >= 3) return
    setPosts(current => {
      const additions = [...socialDemoPosts, competitionNoticePost('leader'), competitionNoticePost('top-three')].filter(demo => !current.some(post => post.id === demo.id))
      return additions.length ? [...current.slice(0, 1), ...additions, ...current.slice(1)] : current
    })
    setSocialVersion(3)
  }, [socialVersion, setPosts, setSocialVersion])
  useEffect(() => { if (onboarded) window.scrollTo({ top: scrollPositions.current[tab], behavior: 'instant' }) }, [tab, onboarded])
  function navigate(next: Tab) {
    scrollPositions.current[tab] = window.scrollY
    setTab(next); setSavedOnly(false); setCompetitionView(null)
  }
  function openStudy(next: StudyTab) { navigate('study'); setStudyTab(next); scrollPositions.current.study = 0; window.scrollTo({ top: 0, behavior: 'instant' }) }
  function savePost(post: Post): string | void {
    const next = [post, ...posts]
    const serialized = JSON.stringify(next)
    if (serialized.length > 1_800_000) return 'В демо мало места для фото. Убери часть новых фотографий или начни демо заново в профиле.'
    try { localStorage.setItem('mayak-posts-v1', serialized) }
    catch { return 'Браузер не смог сохранить пост. Проверь свободное место или разреши локальное хранение.' }
    setPosts(next); setComposer(null); navigate('feed'); setRequestedScope(post.scope)
    scrollPositions.current.feed = 0
    window.scrollTo({ top: 0, behavior: 'instant' })
    notify(post.poll ? 'Опрос опубликован. Пусть свои выберут!' : post.anonymous ? 'Твоя история опубликована без имени' : 'Твоя история теперь в ленте')
  }
  function showCompetition(view: Exclude<CompetitionView, null>) {
    if (!competitionView) scrollPositions.current[tab] = window.scrollY
    setCompetitionView(view); setTab('feed'); setSavedOnly(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function openCompetition() { showCompetition(competition.attempt.phase === 'finished' ? 'ranking' : competition.result ? 'result' : 'quiz') }
  function answerCompetition(questionId: string, optionId: string) {
    const result = competition.answerQuestion(questionId, optionId)
    if (!result) return
    const rankings = rankClasses(applyClassContribution(competition.baseClasses, result), competition.baseClasses)
    const post = completionPost(weeklyCompetition, result, rankings)
    setPosts(current => current.some(p => p.id === post.id) ? current : [post, ...current])
    showCompetition('result')
  }
  function changeCompetitionPhase(phase: CompetitionPhase) {
    competition.setPhase(phase)
    if (phase === 'last-day') {
      const post = competitionNoticePost('last-day')
      setPosts(current => current.some(p => p.id === post.id) ? current : [post, ...current])
    }
  }
  function toggleHomework(id: string) { setHomework(items => items.map(h => h.id === id ? { ...h, done: !h.done } : h)) }
  function reset() {
    competition.resetCompetition(); setCompetitionView(null); setProfile(defaultProfile); setPosts(initialPosts); setHomework(initialHomework); setSchedule(initialSchedule); setNotices(initialNotices); setEventJoined(false); setOnboarded(false); setTab('feed'); setSavedOnly(false); scrollPositions.current = { feed: 0, study: 0, notifications: 0, profile: 0 }
    for (const key of ['mayak-chat-v1', 'mayak-reminders-v1', 'mayak-digest-setting-v1']) { try { localStorage.removeItem(key) } catch { /* Optional storage. */ } }
    notify('Демо снова с чистого листа')
  }
  function openNotice(notice: Notice) {
    if (notice.kind === 'digest') setDigest('morning')
    else if (notice.kind === 'study') openStudy('homework')
    else { navigate('feed'); if (notice.kind === 'comment') setCommentsId('p1') }
  }
  if (starting) return <LighthouseLoader splash />
  if (!onboarded) return <><Onboarding onFinish={p => { setProfile(p); setOnboarded(true); setTab('feed'); window.scrollTo(0, 0) }} />{toast && <Toast message={toast} />}</>
  return <div className="app">{replaying && <div className="lighthouse-replay"><LighthouseLoader splash title="Твой Маяк." description="На одной волне" /><button className="lighthouse-replay-close" onClick={() => setReplaying(false)} autoFocus aria-label="Закрыть анимацию маяка">Закрыть ×</button></div>}<header className="app-header"><div className="header-inner"><button className="brand-button" aria-label="Показать анимацию маяка" title="Зажечь маяк" onClick={() => setReplaying(true)}><Brand /></button><button className="header-school" onClick={() => setCommunity(true)}><MapPin size={15} /><span>{profile.school}</span><span className="header-class">{profile.className}</span><ChevronDown size={14} /></button><div className="header-right"><DemoLabel /><button className="icon-button header-bell" aria-label="Открыть уведомления" onClick={() => navigate('notifications')}><Bell size={20} />{unread > 0 && <i />}</button><button className="header-profile" onClick={() => navigate('profile')} aria-label="Открыть профиль"><Avatar size="small" /><span>{profile.name}</span><ChevronDown size={13} /></button></div></div></header>
    <div className="app-layout"><aside className="sidebar"><div className="sidebar-top"><span className="sidebar-eyebrow">ТВОЙ МАЯК</span><nav className="desktop-nav" aria-label="Основная навигация">{navItems.map(item => <button key={item.id} className={tab === item.id && !savedOnly ? 'active' : ''} aria-current={tab === item.id && !savedOnly ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon size={20} /><span>{item.label}</span>{item.id === 'notifications' && unread > 0 && <span className="nav-badge">{unread}</span>}</button>)}<button className={savedOnly ? 'active' : ''} onClick={() => { navigate('feed'); setSavedOnly(true) }}><Bookmark size={20} /><span>Сохранённое</span>{savedCount > 0 && <small>{savedCount}</small>}</button></nav><button className="button primary sidebar-create" onClick={() => setComposer('menu')}><Plus size={19} />Создать</button><div className="sidebar-divider" /><span className="sidebar-eyebrow">ТВОИ ЛЮДИ</span><button className="sidebar-class" onClick={() => setCommunity(true)}><span className="class-avatar">{profile.className}</span><span><strong>Наш {profile.className}</strong><small><i />28 ребят</small></span><ChevronRight size={15} /></button><button className="sidebar-school" onClick={() => setCommunity(true)}><span className="feature-icon blue"><GraduationCap size={21} /></span><span><strong>{profile.school}</strong><small>Школьное пространство</small></span></button></div><div className="sidebar-bottom"><div className="sidebar-manifest"><span>✳</span><p>Сделано для тебя.<br /><strong>А не для отчётов.</strong></p></div><span>Маяк © 2026 <span>·</span> Демо 9Б</span></div></aside>
      <main className={`main-content ${tab === 'study' ? 'study-page' : ''}`} id="main-content">{competitionView && <CompetitionScreen controller={competition} view={competitionView} onView={showCompetition} onBack={() => navigate('feed')} onAnswer={answerCompetition} onPhase={changeCompetitionPhase} />}<section hidden={tab !== 'feed' || competitionView !== null}><Feed competitionCard={<CompetitionCard controller={competition} onOpen={openCompetition} onRanking={() => showCompetition('ranking')} />} onCompetition={openCompetition} profile={profile} posts={posts} savedOnly={savedOnly} onClearSaved={() => setSavedOnly(false)} onUpdate={post => setPosts(items => items.map(p => p.id === post.id ? post : p))} onCreate={() => setComposer('post')} notify={notify} requestedScope={requestedScope} onScopeApplied={() => setRequestedScope(null)} externalCommentsId={commentsId} onCommentsOpened={() => setCommentsId(null)} /></section><section hidden={tab !== 'study'}><Study active={studyTab} setActive={setStudyTab} schedule={schedule} homework={homework} onToggle={toggleHomework} onAdd={() => setComposer('homework')} onScan={() => setComposer('schedule')} onDigest={setDigest} className={profile.className} /></section><section hidden={tab !== 'notifications'}><Notifications notices={notices} onRead={id => setNotices(items => items.map(n => n.id === id ? { ...n, read: true } : n))} onReadAll={() => { setNotices(items => items.map(n => ({ ...n, read: true }))); notify('Все уведомления прочитаны') }} onOpen={openNotice} /></section><section hidden={tab !== 'profile'}><ProfilePage profile={profile} onUpdate={setProfile} savedCount={savedCount} doneCount={homework.filter(h => h.done).length} postCount={posts.filter(p => !initialPosts.some(initial => initial.id === p.id)).length} onSaved={() => { navigate('feed'); setSavedOnly(true) }} onOnboarding={() => setOnboarded(false)} onReset={reset} notify={notify} /></section></main>
      <aside className="right-rail"><div className="rail-greeting"><span className="little-dot" />СРЕДА, 30 СЕНТЯБРЯ<span>Хороший день, чтобы быть собой.</span></div><section className="card rail-today"><div className="rail-title"><h2>Сегодня в {profile.className}</h2><Tag color="blue">6 уроков</Tag></div><p>Всё важное — рядом</p><div className="rail-lessons">{schedule[2].slice(0, 3).map((l, i) => <div className={i === 2 ? 'current' : ''} key={i}><SubjectIcon subject={l.subject} /><span><strong>{l.subject}</strong><small>{l.time.split('–')[0]}<span>·</span>каб. {l.room}</small></span>{i === 2 && <i />}</div>)}</div><button className="rail-link" onClick={() => openStudy('today')}>Открыть мой день<ArrowRight size={15} /></button></section><button className="rail-ai" onClick={() => { openStudy('tutor') }}><span className="rail-ai-icon"><Sparkles size={24} /></span><span className="ai-card-label">ТВОЙ AI-НАПАРНИК</span><h3>Сложно?<br />Разберёмся вместе.</h3><p>Без «это же очевидно».<br />По шагам и в твоём темпе.</p><span className="rail-ai-link">Спросить репетитора<ArrowRight size={15} /></span><span className="ai-decor">✦</span></button><section className="card rail-homework"><div className="rail-title"><h2>На завтра</h2><span>✏️</span></div><p>{pending.length ? `${pending.length} задания · ${pending.reduce((s, h) => s + h.minutes, 0)} минут` : 'Всё готово. Можно отдыхать.'}</p>{pending.slice(0, 2).map(h => <button key={h.id} onClick={() => openStudy('homework')}><span className={`subject-dot ${subjectsColor(h.subject)}`} /><span>{h.subject}</span><span>{h.minutes} мин</span></button>)}<button className="rail-link" onClick={() => openStudy('homework')}>К домашке<ArrowRight size={15} /></button></section><button className="rail-digest" onClick={() => setDigest('evening')}><span>🌙</span><div><strong>Вечером — выдохнем</strong><small>Твой вечерний AI-дайджест</small></div><ChevronRight size={17} /></button><button className="rail-event" onClick={() => setEvent(true)}><span className="event-icon">☕</span><div><strong>У пятницы есть планы</strong><p>Парк, какао и ребята из класса</p><span>2 октября · 15:30<ArrowRight size={13} /></span></div></button><div className="rail-footer"><Heart size={13} />Сделано для школьника, а не школы.</div></aside>
    </div><nav className="bottom-nav" aria-label="Нижняя навигация"><button className={tab === 'feed' ? 'active' : ''} aria-current={tab === 'feed' ? 'page' : undefined} onClick={() => navigate('feed')}><LayoutGrid size={22} /><span>Лента</span></button><button className={tab === 'study' ? 'active' : ''} aria-current={tab === 'study' ? 'page' : undefined} onClick={() => navigate('study')}><BookOpen size={22} /><span>Учёба</span></button><button className="bottom-create" aria-label="Создать" onClick={() => setComposer('menu')}><span><Plus size={27} /></span></button><button className={tab === 'notifications' ? 'active' : ''} aria-current={tab === 'notifications' ? 'page' : undefined} onClick={() => navigate('notifications')}><span className="bottom-bell"><Bell size={22} />{unread > 0 && <i />}</span><span>Уведомления</span></button><button className={tab === 'profile' ? 'active' : ''} aria-current={tab === 'profile' ? 'page' : undefined} onClick={() => navigate('profile')}><UserRound size={22} /><span>Профиль</span></button></nav>
    {composer === 'menu' && <CreateMenu onClose={() => setComposer(null)} onPost={() => setComposer('post')} onPoll={() => setComposer('poll')} onHomework={() => setComposer('homework')} onSchedule={() => setComposer('schedule')} />}{(composer === 'post' || composer === 'poll') && <PostComposer initialMode={composer} profile={profile} onClose={() => setComposer(null)} onSave={savePost} />}{composer === 'homework' && <HomeworkComposer onClose={() => setComposer(null)} onSave={h => { setHomework(items => [h, ...items]); setComposer(null); openStudy('homework'); notify('Домашка добавлена. По одному делу за раз!') }} />}{composer === 'schedule' && <ScheduleImport onClose={() => setComposer(null)} onSave={s => { setSchedule(s); setComposer(null); openStudy('schedule'); notify('Расписание на неделю сохранено') }} />}
    {digest && <Digest period={digest} setPeriod={setDigest} schedule={schedule} homework={homework} onClose={() => setDigest(null)} onStudy={() => { setDigest(null); openStudy('today') }} />}
    {community && <Modal title="Твои люди" onClose={() => setCommunity(false)}><div className="community-detail"><div className="class-avatar">{profile.className}</div><h3>{profile.school}</h3><p>28 ребят в классе · демо-пространство</p><div className="avatar-stack"><Avatar person="masha" /><Avatar person="artem" /><Avatar person="dasha" /><Avatar /></div></div><div className="soft-note"><Users size={17} />Здесь твои истории, взаимопомощь и планы после уроков.</div><button className="button primary full" onClick={() => { setCommunity(false); navigate('feed') }}>К историям класса<ArrowRight size={17} /></button></Modal>}
    {event && <Modal title="После уроков начинается жизнь" onClose={() => setEvent(false)}><PicnicArt /><div className="event-details"><Tag color="orange">Пятница, 2 октября · 15:30</Tag><h3>Какао, пледы и свои люди</h3><p>Ребята из {profile.className} встречаются у входа в парк. Бери тёплую кофту, плед и что-нибудь вкусное.</p><button className={`button ${eventJoined ? 'secondary' : 'primary'} full`} onClick={() => { setEventJoined(!eventJoined); notify(eventJoined ? 'Планы обновлены' : 'Ты с нами! Увидимся в пятницу ☕') }}>{eventJoined ? 'Я в списке · отменить' : 'Я с вами'}<Heart size={17} /></button></div></Modal>}
    {toast && <Toast message={toast} />}
  </div>
}
function subjectsColor(subject: string) { return subject === 'Русский язык' ? 'blue' : 'purple' }
