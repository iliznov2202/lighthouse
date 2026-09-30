import { useEffect, useState } from 'react'
import { Bookmark, ChevronDown, Plus, Search, Send, Shield, Sparkles, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Post, Profile, Scope } from '../types'
import { Avatar, Empty, Lighthouse, Modal, PicnicArt, Tag } from './ui'
import SocialPost from './SocialPost'

interface Props {
  competitionCard: ReactNode; onCompetition: () => void;
  profile: Profile; posts: Post[]; savedOnly: boolean; onClearSaved: () => void;
  onUpdate: (post: Post) => void; onCreate: () => void; notify: (message: string) => void;
  externalCommentsId: string | null; onCommentsOpened: () => void; requestedScope: Scope | null; onScopeApplied: () => void
}
export default function Feed({ competitionCard, onCompetition, profile, posts, onUpdate, onCreate, savedOnly, onClearSaved, notify, externalCommentsId, onCommentsOpened, requestedScope, onScopeApplied }: Props) {
  const [scope, setScope] = useState<Scope>('class')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [anonymousOnly, setAnonymousOnly] = useState(false)
  const [commentsId, setCommentsId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [community, setCommunity] = useState<string | null>(null)
  useEffect(() => { if (externalCommentsId) { setCommentsId(externalCommentsId); onCommentsOpened() } }, [externalCommentsId, onCommentsOpened])
  useEffect(() => { if (requestedScope) { setScope(requestedScope); setAnonymousOnly(false); setSearch(''); onScopeApplied() } }, [requestedScope, onScopeApplied])
  const commentsPost = posts.find(p => p.id === commentsId)
  const menuPost = posts.find(p => p.id === menuId)
  const visible = posts.filter(p => (savedOnly ? p.saved : p.scope === scope) && (!anonymousOnly || p.anonymous) && `${p.text} ${p.author} ${p.poll?.question ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  return <>
    <div className="page-heading"><div><span className="eyebrow">СРЕДА, 30 СЕНТЯБРЯ</span><h1>Привет, {profile.name} <span className="wave-emoji">👋</span></h1><p>Учёба, друзья и всё, что между.</p></div><button className={`icon-button heading-search ${searchOpen ? 'active' : ''}`} aria-label="Поиск по ленте" onClick={() => setSearchOpen(!searchOpen)}><Search size={21} /></button></div>
    {!savedOnly && competitionCard}
    <div className="feed-hero"><div><span className="hero-kicker"><span className="little-dot" />ТВОЁ ПРОСТРАНСТВО</span><h2>На одной волне.</h2><p>Свои люди. Большие перемены.<br />И маленькие истории каждый день.</p><span className="hero-class">{profile.className}<span>·</span>{profile.school}</span></div><div className="hero-art"><div className="hero-orbit" /><Lighthouse /><span className="hero-star one">✦</span><span className="hero-star two">✧</span></div></div>
    <div className="community-strip"><button onClick={() => { setScope('class'); setAnonymousOnly(false); setCommunity('class') }}><span className="community-circle class-circle">{profile.className}<span className="online-dot" /></span><strong>Наш {profile.className}</strong></button><button onClick={() => setCommunity('plans')}><span className="community-circle plans-circle">☕</span><strong>После уроков</strong></button><button onClick={() => { setScope('school'); setAnonymousOnly(false) }}><span className="community-circle school-circle">🎸</span><strong>Школьный движ</strong></button><button aria-pressed={anonymousOnly} onClick={() => { setScope('class'); setAnonymousOnly(!anonymousOnly) }}><span className={`community-circle anon-circle ${anonymousOnly ? 'selected' : ''}`}><Shield size={25} /></span><strong>Без имени</strong></button><button onClick={onCreate}><span className="community-circle add-circle"><Plus size={25} /></span><strong>Твоя история</strong></button></div>
    <button className="post-prompt" onClick={onCreate}><Avatar /><span>Что нового, {profile.name}?</span><span className="prompt-plus"><Plus size={18} /></span></button>
    <div className="feed-toolbar">{savedOnly ? <h2 className="saved-title"><Bookmark size={18} />Сохранённое<button className="icon-button" aria-label="Вернуться в ленту" onClick={onClearSaved}><X size={16} /></button></h2> : <div className="underline-tabs"><button className={scope === 'class' ? 'active' : ''} onClick={() => { setScope('class'); setAnonymousOnly(false) }}>Мой класс<span>{profile.className}</span></button><button className={scope === 'school' ? 'active' : ''} onClick={() => { setScope('school'); setAnonymousOnly(false) }}>Вся школа</button></div>}<span className="feed-order">Свежее<ChevronDown size={13} /></span></div>
    {searchOpen && <label className="search-field feed-search"><Search size={17} /><input autoFocus placeholder="Найти пост или автора" aria-label="Текст поиска" value={search} onChange={e => setSearch(e.target.value)} />{search && <button className="icon-button" aria-label="Очистить поиск" onClick={() => setSearch('')}><X size={16} /></button>}</label>}
    {anonymousOnly && <div className="filter-notice"><Shield size={15} />Истории без имени<button onClick={() => setAnonymousOnly(false)}>Сбросить</button></div>}
    <div className="post-list">{visible.map(post => <SocialPost onCompetition={onCompetition} key={post.id} post={post} profile={profile} onUpdate={onUpdate} onComments={() => { setCommentsId(post.id); setComment('') }} onMenu={() => setMenuId(post.id)} notify={notify} />)}</div>
    {!visible.length && <Empty title={savedOnly ? 'Здесь будут твои находки' : 'Пока тихо'}>{savedOnly ? 'Сохрани понравившийся пост значком закладки.' : 'Попробуй другой запрос или поделись первой историей.'}</Empty>}
    <div className="feed-end"><Sparkles size={14} /><span>Ты в курсе всего. Теперь можно выдохнуть.</span></div>
    {commentsPost && <Modal title="На одной волне в комментариях" onClose={() => setCommentsId(null)}><p className="comment-context">{commentsPost.text}</p><div className="comments-list">{commentsPost.comments.map(c => <div className="comment-row" key={c.id}><Avatar person={c.avatar} size="small" /><div><strong>{c.author}</strong><p>{c.text}</p></div></div>)}{!commentsPost.comments.length && <Empty title="Начни разговор">Твоё сообщение может стать первым.</Empty>}</div><form className="message-input" onSubmit={e => { e.preventDefault(); if (!comment.trim()) return; onUpdate({ ...commentsPost, comments: [...commentsPost.comments, { id: crypto.randomUUID(), author: profile.name, avatar: 'sasha', text: comment.trim() }] }); setComment('') }}><input aria-label="Комментарий" maxLength={500} value={comment} onChange={e => setComment(e.target.value)} placeholder="Напиши что-нибудь хорошее…" /><button className="send-button" aria-label="Отправить комментарий" disabled={!comment.trim()}><Send size={18} /></button></form></Modal>}
    {menuPost && <Modal title="Публикация" onClose={() => setMenuId(null)}><div className="action-list"><button onClick={() => { onUpdate({ ...menuPost, saved: !menuPost.saved }); setMenuId(null); notify(menuPost.saved ? 'Убрано из сохранённого' : 'Сохранено') }}><Bookmark size={20} /><span>{menuPost.saved ? 'Убрать из сохранённого' : 'Сохранить на потом'}</span></button><button onClick={() => { setMenuId(null); notify('Демо: жалоба отмечена. Реальной отправки нет.') }}><Shield size={20} /><span>Пожаловаться на публикацию</span></button></div></Modal>}
    {community && <Modal title={community === 'class' ? `Это наш ${profile.className}` : 'Пятница после уроков'} onClose={() => setCommunity(null)}>{community === 'class' ? <><div className="community-detail"><div className="class-avatar">{profile.className}</div><h3>{profile.school}</h3><p>28 ребят, много историй и одно расписание.</p><div className="avatar-stack"><Avatar person="masha" /><Avatar person="artem" /><Avatar person="dasha" /><Avatar /></div></div><div className="soft-note">Здесь можно спрашивать, помогать и быть собой. Бережно относимся друг к другу.</div></> : <><PicnicArt /><div className="event-details"><Tag color="orange">2 октября · 15:30</Tag><h3>Какао, пледы и свои люди</h3><p>Встречаемся у входа в парк после уроков. Бери тёплую кофту и хорошее настроение.</p><button className="button primary full" onClick={() => { setCommunity(null); notify('Ты в списке! Увидимся в пятницу ☕') }}>Я с вами</button></div></>}</Modal>}
  </>
}
