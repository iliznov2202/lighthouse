import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Bell, BookOpen, Bookmark, ChevronDown, ChevronRight, GraduationCap, Heart, LayoutGrid, MapPin, Plus, UserRound, Users } from './design/icons'
import { defaultProfile, initialHomework, initialNotices, initialPosts, initialSchedule, socialDemoPosts } from './data/mock'
import { CompetitionCard, CompetitionScreen } from './features/competition/Competition'
import { useCompetition } from './features/competition/useCompetition'
import { knowledgeQuiz, weeklyCompetition, initialClassRankings, finalClassRankings, initialStudentRankings, newClassTemplate, competitionNoticePost } from './features/competition/mock'
import { applyClassContribution, completionPost, rankClasses } from './features/competition/logic'
import type { CompetitionView, CompetitionPhase } from './features/competition/types'
import Sticker from './components/Sticker'
import { InstallApp, ConnectionStatus } from './components/InstallApp'
import type { Homework, Lesson, Notice, Post, Profile, Scope, StudyTab, Tab } from './types'
import { useStoredState } from './hooks/useStoredState'
import { clearPostDraft } from './lib/postDraft'
import { UserAvatarProvider } from './hooks/UserAvatarContext'
import { classMembers, firstVisitHomework } from './features/onboarding/mock'
import { clearPendingRegistration, resetMockRegistration, saveMockSession } from './features/onboarding/service'
import type { MockUser } from './features/onboarding/types'
import NotificationPreview from './components/NotificationPreview'
import Onboarding from './components/Onboarding'
import CommunityPicker from './features/onboarding/CommunityPicker'
import Feed from './components/Feed'
import Study, { Digest } from './components/Study'
import { Notifications, ProfilePage } from './components/Personal'
import { CreateMenu, HomeworkComposer, PostComposer, ScheduleImport } from './components/Composer'
import { Avatar, Brand, DemoLabel, LighthouseLoader, Modal, PicnicArt, SubjectIcon, Tag, Toast } from './components/ui'

type Composer = 'menu' | 'post' | 'poll' | 'homework' | 'schedule' | null
const navItems = [{ id: 'feed' as const, label: 'Лента', icon: LayoutGrid }, { id: 'study' as const, label: 'Учёба', icon: BookOpen }, { id: 'notifications' as const, label: 'Уведомления', icon: Bell }, { id: 'profile' as const, label: 'Профиль', icon: UserRound }]
export interface AppProps { initialAuthView?: 'account' | 'login'; authRoute?: boolean; introReward?: boolean; onAuthenticated?: () => void; onHome?: () => void }
export default function App({ initialAuthView = 'account', authRoute = false, introReward = false, onAuthenticated, onHome }: AppProps = {}) {
  const [starting, setStarting] = useState(!authRoute)
  const [logoAnimation, setLogoAnimation] = useState(0)
  const logoAnimationSequence = useRef(0)
  useEffect(() => {
    if (!logoAnimation) return
    const timer = window.setTimeout(() => setLogoAnimation(0), 2750)
    return () => window.clearTimeout(timer)
  }, [logoAnimation])
  useEffect(() => {
    if (!starting) return
    const timer = window.setTimeout(() => setStarting(false), 2750)
    return () => window.clearTimeout(timer)
  }, [starting])
  const [onboarded, setOnboarded] = useStoredState('mayak-onboarded-v1', false)
  const [profile, setProfile] = useStoredState<Profile>('mayak-profile-v1', defaultProfile)
  const [posts, setPosts] = useStoredState<Post[]>('mayak-posts-v1', initialPosts)
  const [homework, setHomework] = useStoredState<Homework[]>('mayak-homework-v1', initialHomework)
  const [schedule, setSchedule] = useStoredState<Lesson[][]>('mayak-schedule-v1', initialSchedule)
  const [notices, setNotices] = useStoredState<Notice[]>('mayak-notices-v1', initialNotices)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsVersion, setNotificationsVersion] = useState(0)
  const notificationsAnchor = useRef<HTMLButtonElement>(null)
  const [socialVersion, setSocialVersion] = useStoredState('mayak-social-version', 0)
  const competition = useCompetition(knowledgeQuiz, weeklyCompetition, profile, initialClassRankings, finalClassRankings, initialStudentRankings, newClassTemplate)
  const [competitionView, setCompetitionView] = useState<CompetitionView>(null)
  const scrollPositions = useRef<Record<Tab, number>>({ feed: 0, study: 0, notifications: 0, profile: 0 })
  const [tab, setTab] = useState<Tab>('feed')
  const [studyTab, setStudyTab] = useState<StudyTab>('today')
  const [composer, setComposer] = useState<Composer>(null)
  const [digest, setDigest] = useState<'morning' | 'evening' | null>(null)
  const [savedOnly, setSavedOnly] = useState(false)
  const [community, setCommunity] = useState(false)
  const [communityPicker, setCommunityPicker] = useState(false)
  const [event, setEvent] = useState(false)
  const [eventJoined, setEventJoined] = useStoredState('mayak-event-v1', false)
  const [commentsId, setCommentsId] = useState<string | null>(null)
  const [requestedScope, setRequestedScope] = useState<Scope | null>(null)
  const [toast, setToast] = useState('')
  const [toastAction, setToastAction] = useState<{ label: string; run: () => void } | undefined>()
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const members = classMembers(profile)
  const unread = notices.filter(n => !n.read).length
  const savedCount = posts.filter(p => p.saved).length
  const pending = homework.filter(h => !h.done && h.date === '2026-10-01')
  function notify(message: string, action?: { label: string; run: () => void }) { setToastAction(action); if (toastTimer.current) clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => { setToast(''); setToastAction(undefined) }, action ? 8000 : 3600) }
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])
  useEffect(() => {
    if (socialVersion >= 3) return
    setPosts(current => {
      const additions = [...socialDemoPosts, competitionNoticePost('leader'), competitionNoticePost('top-three')].filter(demo => !current.some(post => post.id === demo.id))
      return additions.length ? [...current.slice(0, 1), ...additions, ...current.slice(1)] : current
    })
    setSocialVersion(3)
  }, [socialVersion, setPosts, setSocialVersion])
  useEffect(() => { if (onboarded) window.scrollTo({ top: competitionView ? 0 : scrollPositions.current[tab], behavior: 'instant' }) }, [tab, onboarded, competitionView])
  function navigate(next: Tab) {
    scrollPositions.current[tab] = window.scrollY
    setNotificationsOpen(false); setTab(next); setSavedOnly(false); setCompetitionView(null)
  }
  function closeNotifications(restoreFocus = false) {
    setNotificationsOpen(false)
    if (restoreFocus) notificationsAnchor.current?.focus({ preventScroll: true })
  }
  function readNotice(id: string) { setNotices(items => items.map(notice => notice.id === id ? { ...notice, read: true } : notice)) }
  function readAllNotices() {
    setNotices(items => items.map(notice => ({ ...notice, read: true })))
    notify('Все уведомления прочитаны')
  }
  function viewAllNotifications() {
    setNotificationsVersion(version => version + 1)
    navigate('notifications')
    scrollPositions.current.notifications = 0
    window.scrollTo({ top: 0, behavior: 'instant' })
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
  useEffect(() => {
    const result = competition.result
    if (!result) return
    const rankings = rankClasses(applyClassContribution(competition.baseClasses, result), competition.baseClasses)
    const post = completionPost(competition.event, result, rankings)
    setPosts(current => current.some(p => p.id === post.id) ? current : [post, ...current])
  }, [competition.result, setPosts])
  function showCompetition(view: Exclude<CompetitionView, null>) {
    if (!competitionView) scrollPositions.current[tab] = window.scrollY
    setCompetitionView(view); setTab('feed'); setSavedOnly(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function openCompetition() { showCompetition(competition.attempt.phase === 'finished' ? 'ranking' : competition.result ? 'result' : 'quiz') }
  function answerCompetition(questionId: string, optionId: string) {
    const result = competition.answerQuestion(questionId, optionId)
    if (!result) return
    showCompetition('result')
  }
  function changeCompetitionPhase(phase: CompetitionPhase) {
    competition.setPhase(phase)
    if (phase === 'last-day') {
      const post = competitionNoticePost('last-day')
      setPosts(current => current.some(p => p.id === post.id) ? current : [post, ...current])
    }
  }
  function deletePost(post: Post) {
    const index = posts.findIndex(item => item.id === post.id)
    setPosts(items => items.filter(item => item.id !== post.id))
    notify('Публикация удалена', { label: 'Отменить', run: () => {
      setPosts(items => { if (items.some(item => item.id === post.id)) return items; const restored = [...items]; restored.splice(Math.max(0, index), 0, post); return restored })
      notify('Публикация восстановлена')
    } })
  }
  function toggleHomework(id: string) { setHomework(items => items.map(h => h.id === id ? { ...h, done: !h.done } : h)) }
  function reset() {
    resetMockRegistration()
    clearPostDraft()
    setNotificationsOpen(false); competition.resetCompetition(); setCompetitionView(null); setProfile(defaultProfile); setPosts(initialPosts); setHomework(initialHomework); setSchedule(initialSchedule); setNotices(initialNotices); setEventJoined(false); setOnboarded(false); setTab('feed'); setSavedOnly(false); scrollPositions.current = { feed: 0, study: 0, notifications: 0, profile: 0 }
    for (const key of ['mayak-chat-v1', 'mayak-reminders-v1', 'mayak-digest-setting-v1', 'mayak-comment-drafts-v1']) { try { localStorage.removeItem(key) } catch { /* Optional storage. */ } }
    notify('Демо снова с чистого листа')
  }
  function openNotice(notice: Notice) {
    if (notice.kind === 'digest') setDigest('morning')
    else if (notice.kind === 'study') openStudy('homework')
    else { navigate('feed'); if (notice.kind === 'comment') setCommentsId('p1') }
  }
  function completeOnboarding(next: Profile, user?: MockUser, newRegistration = false) {
    try {
      localStorage.setItem('mayak-profile-v1', JSON.stringify(next))
      if (user) saveMockSession(user)
      localStorage.setItem('mayak-onboarded-v1', 'true')
    } catch { throw new Error('Браузер не смог сохранить вход. Проверь доступ к локальному хранению и попробуй ещё раз.') }
    if (newRegistration) {
      clearPostDraft(); competition.resetCompetition(); setSchedule(structuredClone(initialSchedule)); setHomework(structuredClone(firstVisitHomework))
      setPosts(initialPosts.map(post => ({ ...post, author: post.anonymous ? `Кто-то из ${next.className}` : post.author }))); setNotices(structuredClone(initialNotices)); setEventJoined(false)
    }
    clearPendingRegistration(); setProfile(next); setOnboarded(true); setTab('feed'); window.scrollTo(0, 0); onAuthenticated?.()
  }
  if (starting) return <LighthouseLoader splash />
  if (!onboarded || authRoute) return <><Onboarding key={initialAuthView} initialView={initialAuthView} introReward={introReward} onHome={onHome} onFinish={completeOnboarding} />{toast && <Toast message={toast} action={toastAction} />}</>
  return <UserAvatarProvider avatarUrl={profile.avatarUrl}><div className={`app ${competitionView === 'quiz' ? 'quiz-focus' : ''}`}><header className="app-header"><div className="header-inner"><button className="brand-button" aria-label="Показать анимацию маяка" title="Зажечь маяк" onClick={() => setLogoAnimation(++logoAnimationSequence.current)}><Brand animation={logoAnimation} /></button><button className="header-school" onClick={() => setCommunity(true)}><MapPin /><span>{profile.school}</span><span className="header-class">{profile.className}</span><ChevronDown /></button><div className="header-right"><DemoLabel /><button ref={notificationsAnchor} className="icon-button header-bell" aria-label="Открыть уведомления" aria-haspopup="dialog" aria-expanded={notificationsOpen} aria-controls={notificationsOpen ? 'notification-preview' : undefined} onClick={() => setNotificationsOpen(open => !open)}><Bell />{unread > 0 && <i />}</button><button className="header-profile" onClick={() => navigate('profile')} aria-label="Открыть профиль"><Avatar size="small" /><span>{profile.name}</span><ChevronDown /></button></div></div></header>
    <div className="app-layout"><aside className="sidebar"><div className="sidebar-top"><span className="sidebar-eyebrow">ТВОЙ МАЯК</span><nav className="desktop-nav" aria-label="Основная навигация">{navItems.map(item => <button key={item.id} className={tab === item.id && !savedOnly ? 'active' : ''} aria-current={tab === item.id && !savedOnly ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon /><span>{item.label}</span>{item.id === 'notifications' && unread > 0 && <span className="nav-badge">{unread}</span>}</button>)}<button className={savedOnly ? 'active' : ''} onClick={() => { navigate('feed'); setSavedOnly(true) }}><Bookmark /><span>Сохранённое</span>{savedCount > 0 && <small>{savedCount}</small>}</button></nav><button className="button primary sidebar-create" onClick={() => setComposer('menu')}><Plus />Создать</button><div className="sidebar-divider" /><span className="sidebar-eyebrow">ТВОИ ЛЮДИ</span><button className="sidebar-class" onClick={() => setCommunity(true)}><span className="class-avatar">{profile.className}</span><span><strong>Наш {profile.className}</strong><small><i />{members} ребят</small></span><ChevronRight /></button><button className="sidebar-school" onClick={() => setCommunity(true)}><span className="feature-icon blue"><GraduationCap /></span><span><strong>{profile.school}</strong><small>Школьное пространство</small></span></button></div><div className="sidebar-bottom"><span>Маяк © 2026 <span>·</span> Демо 9Б</span></div></aside>
      <main className={`main-content ${tab === 'study' ? 'study-page' : ''}`} id="main-content">{competitionView && <CompetitionScreen controller={competition} view={competitionView} onView={showCompetition} onBack={() => navigate('feed')} onAnswer={answerCompetition} onPhase={changeCompetitionPhase} />}<section hidden={tab !== 'feed' || competitionView !== null}><Feed competitionCard={<CompetitionCard controller={competition} onOpen={openCompetition} onRanking={() => showCompetition('ranking')} />} onCompetition={openCompetition} profile={profile} posts={posts} onDelete={deletePost} savedOnly={savedOnly} onClearSaved={() => setSavedOnly(false)} onUpdate={post => setPosts(items => items.map(p => p.id === post.id ? post : p))} onCreate={() => setComposer('post')} notify={notify} requestedScope={requestedScope} onScopeApplied={() => setRequestedScope(null)} externalCommentsId={commentsId} onCommentsOpened={() => setCommentsId(null)} /></section><section hidden={tab !== 'study'}><Study active={studyTab} setActive={setStudyTab} schedule={schedule} homework={homework} onToggle={toggleHomework} onAdd={() => setComposer('homework')} onScan={() => setComposer('schedule')} onDigest={setDigest} className={profile.className} /></section><section hidden={tab !== 'notifications'}><Notifications viewVersion={notificationsVersion} notices={notices} onRead={readNotice} onReadAll={readAllNotices} onOpen={openNotice} /></section><section hidden={tab !== 'profile'}><ProfilePage profile={profile} onUpdate={setProfile} savedCount={savedCount} doneCount={homework.filter(h => h.done).length} postCount={posts.filter(p => !p.competitionEventId && !initialPosts.some(initial => initial.id === p.id)).length} onSaved={() => { navigate('feed'); setSavedOnly(true) }} onOnboarding={() => setCommunityPicker(true)} onReset={reset} notify={notify} /><InstallApp /></section></main>
      <aside className="right-rail"><section className="card rail-today"><div className="rail-title"><h2>Сегодня в {profile.className}</h2><Tag color="blue">6 уроков</Tag></div><p>Всё важное — рядом</p><div className="rail-lessons">{schedule[2].slice(0, 3).map((l, i) => <div className={i === 2 ? 'current' : ''} key={i}><SubjectIcon subject={l.subject} /><span><strong>{l.subject}</strong><small>{l.time.split('–')[0]}<span>·</span>каб. {l.room}</small></span>{i === 2 && <i />}</div>)}</div><button className="rail-link" onClick={() => openStudy('today')}>Открыть мой день<ArrowRight /></button></section><button className="rail-ai" onClick={() => { openStudy('tutor') }}><span className="rail-ai-icon"><BookOpen /></span><span className="ai-card-label">ПОМОЩЬ С УЧЁБОЙ</span><h3>Разобрать задание</h3><p>Объяснение темы и решение по шагам.</p><span className="rail-ai-link">Спросить репетитора<ArrowRight /></span></button><section className="card rail-homework"><div className="rail-title"><h2>На завтра</h2><Sticker name="note" className="rail-note-sticker" /></div><p>{pending.length ? `${pending.length} задания · ${pending.reduce((s, h) => s + h.minutes, 0)} минут` : 'Всё готово. Можно отдыхать.'}</p>{pending.slice(0, 2).map(h => <button key={h.id} onClick={() => openStudy('homework')}><span className={`subject-dot ${subjectsColor(h.subject)}`} /><span>{h.subject}</span><span>{h.minutes} мин</span></button>)}<button className="rail-link" onClick={() => openStudy('homework')}>К домашке<ArrowRight /></button></section><button className="rail-digest" onClick={() => setDigest('evening')}><Sticker name="knitting" className="rail-small-sticker" /><div><strong>План на завтра</strong><small>Задания и расписание</small></div><ChevronRight /></button><button className="rail-event" onClick={() => setEvent(true)}><Sticker name="friends" className="rail-small-sticker" /><div><strong>Встреча в пятницу</strong><p>Парк, какао и ребята из класса</p><span>2 октября · 15:30<ArrowRight /></span></div></button></aside>
    </div><nav className="bottom-nav" aria-label="Нижняя навигация"><button className={tab === 'feed' ? 'active' : ''} aria-current={tab === 'feed' ? 'page' : undefined} onClick={() => navigate('feed')}><LayoutGrid /><span>Лента</span></button><button className={tab === 'study' ? 'active' : ''} aria-current={tab === 'study' ? 'page' : undefined} onClick={() => navigate('study')}><BookOpen /><span>Учёба</span></button><button className="bottom-create" aria-label="Создать" onClick={() => setComposer('menu')}><span><Plus /></span></button><button className={tab === 'notifications' ? 'active' : ''} aria-current={tab === 'notifications' ? 'page' : undefined} onClick={() => navigate('notifications')}><span className="bottom-bell"><Bell />{unread > 0 && <i />}</span><span>Уведомления</span></button><button className={tab === 'profile' ? 'active' : ''} aria-current={tab === 'profile' ? 'page' : undefined} onClick={() => navigate('profile')}><UserRound /><span>Профиль</span></button></nav>
    {notificationsOpen && <NotificationPreview notices={notices} anchor={notificationsAnchor} onClose={closeNotifications} onRead={readNotice} onReadAll={readAllNotices} onOpen={openNotice} onViewAll={viewAllNotifications} />}
    {composer === 'menu' && <CreateMenu onClose={() => setComposer(null)} onPost={() => setComposer('post')} onPoll={() => setComposer('poll')} onHomework={() => setComposer('homework')} onSchedule={() => setComposer('schedule')} />}{(composer === 'post' || composer === 'poll') && <PostComposer initialMode={composer} profile={profile} onClose={() => setComposer(null)} onSave={savePost} />}{composer === 'homework' && <HomeworkComposer onClose={() => setComposer(null)} onSave={h => { setHomework(items => [h, ...items]); setComposer(null); openStudy('homework'); notify('Домашка добавлена. По одному делу за раз!') }} />}{composer === 'schedule' && <ScheduleImport onClose={() => setComposer(null)} onSave={s => { setSchedule(s); setComposer(null); openStudy('schedule'); notify('Расписание на неделю сохранено') }} />}
    {digest && <Digest period={digest} setPeriod={setDigest} schedule={schedule} homework={homework} onClose={() => setDigest(null)} onStudy={() => { setDigest(null); openStudy('today') }} />}
    {community && <Modal title="Твои люди" onClose={() => setCommunity(false)}><div className="community-detail"><div className="class-avatar">{profile.className}</div><h3>{profile.school}</h3><p>{members} ребят в классе · демо-пространство</p><div className="avatar-stack"><Avatar person="masha" /><Avatar person="artem" /><Avatar person="dasha" /><Avatar /></div></div><div className="soft-note"><Users />Здесь твои истории, взаимопомощь и планы после уроков.</div><button className="button primary full" onClick={() => { setCommunity(false); navigate('feed') }}>К историям класса<ArrowRight /></button></Modal>}
    {event && <Modal title="После уроков начинается жизнь" onClose={() => setEvent(false)}><PicnicArt /><div className="event-details"><Tag color="orange">Пятница, 2 октября · 15:30</Tag><h3>Какао, пледы и свои люди</h3><p>Ребята из {profile.className} встречаются у входа в парк. Бери тёплую кофту, плед и что-нибудь вкусное.</p><button className={`button ${eventJoined ? 'secondary' : 'primary'} full`} onClick={() => { setEventJoined(!eventJoined); notify(eventJoined ? 'Планы обновлены' : 'Ты с нами! Увидимся в пятницу ☕') }}>{eventJoined ? 'Я в списке · отменить' : 'Я с вами'}<Heart /></button></div></Modal>}
    {toast && <Toast message={toast} action={toastAction} />}
    {communityPicker && <CommunityPicker profile={profile} onClose={() => setCommunityPicker(false)} onSave={next => { setProfile(next); notify('Школа и класс обновлены') }} />}
  <ConnectionStatus /></div></UserAvatarProvider>
}
function subjectsColor(subject: string) { return subject === 'Русский язык' ? 'blue' : 'purple' }
