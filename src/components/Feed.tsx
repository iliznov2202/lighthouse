import { useEffect, useRef, useState } from 'react'
import { Clock3, Music2, Bookmark, Check, ChevronDown, Plus, Search, Send, Shield, Sparkles, X } from '../design/icons'
import type { ReactNode } from 'react'
import type { Post, Profile, Scope } from '../types'
import { Avatar, Empty, Lighthouse, Modal, PicnicArt, Tag } from './ui'
import SocialPost from './SocialPost'
import { useStoredState } from '../hooks/useStoredState'
import Sticker from './Sticker'
import { feedOrders, sortFeedPosts, type FeedOrder } from '../lib/feedOrder'

interface Props {
  competitionCard: ReactNode; onCompetition: () => void;
  profile: Profile; posts: Post[]; savedOnly: boolean; onClearSaved: () => void;
  onUpdate: (post: Post) => void; onCreate: () => void; notify: (message: string) => void;
  externalCommentsId: string | null; onCommentsOpened: () => void; requestedScope: Scope | null; onScopeApplied: () => void
}
export default function Feed({ competitionCard, onCompetition, profile, posts, onUpdate, onCreate, savedOnly, onClearSaved, notify, externalCommentsId, onCommentsOpened, requestedScope, onScopeApplied }: Props) {
  const [bannerHidden, setBannerHidden] = useStoredState('mayak-banner-hidden-v1', false)
  const [scope, setScope] = useState<Scope>('class')
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchTrigger = useRef<HTMLButtonElement>(null)
  const [order, setOrder] = useStoredState<FeedOrder>('mayak-feed-order-v1', 'recent')
  const [orderOpen, setOrderOpen] = useState(false)
  const currentOrder = feedOrders.find(item => item.id === order) ?? feedOrders[0]
  const [anonymousOnly, setAnonymousOnly] = useState(false)
  const [commentsId, setCommentsId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const commentsList = useRef<HTMLDivElement>(null)
  const [community, setCommunity] = useState<string | null>(null)
  useEffect(() => { if (externalCommentsId) { setCommentsId(externalCommentsId); onCommentsOpened() } }, [externalCommentsId, onCommentsOpened])
  useEffect(() => { if (requestedScope) { setScope(requestedScope); setAnonymousOnly(false); setSearch(''); onScopeApplied() } }, [requestedScope, onScopeApplied])
  const commentsPost = posts.find(p => p.id === commentsId)
  useEffect(() => {
    if (commentsList.current) commentsList.current.scrollTop = commentsList.current.scrollHeight
  }, [commentsId, commentsPost?.comments.length])
  const menuPost = posts.find(p => p.id === menuId)
  const visible = sortFeedPosts(posts.filter(p => (savedOnly ? p.saved : p.scope === scope) && (!anonymousOnly || p.anonymous) && `${p.text} ${p.author} ${p.poll?.question ?? ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), currentOrder.id)
  const resultWord = new Intl.PluralRules('ru').select(visible.length)
  function closeSearch() { setSearchOpen(false); setSearch(''); searchTrigger.current?.focus() }
  return <>
    <div className="page-heading"><div><span className="eyebrow">СРЕДА, 30 СЕНТЯБРЯ</span><h1>Привет, {profile.name} <Sticker name="friends" className="greeting-sticker" /></h1><p>Учёба, друзья и всё, что между.</p></div><button ref={searchTrigger} className={`icon-button heading-search ${searchOpen ? 'active' : ''}`} aria-label="Поиск по ленте" aria-expanded={searchOpen} aria-controls={searchOpen ? 'feed-search' : undefined} onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}><Search /></button></div>
    {!savedOnly && competitionCard}
    {!bannerHidden && <div className="feed-hero"><button className="feed-hero-close" aria-label="Скрыть баннер" title="Скрыть баннер" onClick={() => setBannerHidden(true)}><X /></button><div><h2>На одной волне.</h2><p>Свои люди. Большие перемены.<br />И маленькие истории каждый день.</p><span className="hero-class">{profile.className}<span>·</span>{profile.school}</span></div><div className="hero-art"><div className="hero-orbit" /><Lighthouse /><span className="hero-star one"><Sparkles /></span><span className="hero-star two"><Sparkles /></span></div></div>}
    <div className="community-strip"><button onClick={() => { setScope('class'); setAnonymousOnly(false); setCommunity('class') }}><span className="community-circle class-circle">{profile.className}<span className="online-dot" /></span><strong>Наш {profile.className}</strong></button><button onClick={() => setCommunity('plans')}><span className="community-circle plans-circle"><Clock3 /></span><strong>После уроков</strong></button><button onClick={() => { setScope('school'); setAnonymousOnly(false) }}><span className="community-circle school-circle"><Music2 /></span><strong>Школьный движ</strong></button><button aria-pressed={anonymousOnly} onClick={() => { setScope('class'); setAnonymousOnly(!anonymousOnly) }}><span className={`community-circle anon-circle ${anonymousOnly ? 'selected' : ''}`}><Shield /></span><strong>Без имени</strong></button><button onClick={onCreate}><span className="community-circle add-circle"><Plus /></span><strong>Твоя история</strong></button></div>
    <button className="post-prompt" onClick={onCreate}><Avatar /><span>Что нового, {profile.name}?</span><span className="prompt-plus"><Plus /></span></button>
    <div className="feed-toolbar">{savedOnly ? <h2 className="saved-title"><Bookmark />Сохранённое<button className="icon-button" aria-label="Вернуться в ленту" onClick={onClearSaved}><X /></button></h2> : <div className="underline-tabs"><button className={scope === 'class' ? 'active' : ''} aria-pressed={scope === 'class'} onClick={() => { setScope('class'); setAnonymousOnly(false) }}>Мой класс<span>{profile.className}</span></button><button className={scope === 'school' ? 'active' : ''} aria-pressed={scope === 'school'} onClick={() => { setScope('school'); setAnonymousOnly(false) }}>Вся школа</button></div>}<button className="feed-order" aria-label={`Порядок публикаций: ${currentOrder.label}`} aria-haspopup="dialog" aria-expanded={orderOpen} onClick={() => setOrderOpen(true)}>{currentOrder.label}<ChevronDown /></button></div>
    {searchOpen && <div id="feed-search"><label className="search-field feed-search"><Search /><input autoFocus placeholder="Найти пост или автора" aria-label="Текст поиска" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); closeSearch() } }} />{search && <button className="icon-button" aria-label="Очистить поиск" onClick={() => setSearch('')}><X /></button>}</label>{search.trim() && <p className="feed-search-results" role="status">{visible.length} {resultWord === 'one' ? 'публикация' : resultWord === 'few' ? 'публикации' : 'публикаций'} по твоему запросу</p>}</div>}
    {anonymousOnly && <div className="filter-notice"><Shield />Истории без имени<button onClick={() => setAnonymousOnly(false)}>Сбросить</button></div>}
    <div className="post-list">{visible.map(post => <SocialPost onCompetition={onCompetition} key={post.id} post={post} profile={profile} onUpdate={onUpdate} onComments={() => { setCommentsId(post.id); setComment('') }} onMenu={() => setMenuId(post.id)} notify={notify} />)}</div>
    {!visible.length && <Empty title={savedOnly ? 'Здесь будут твои находки' : 'Пока тихо'}>{savedOnly ? 'Сохрани понравившийся пост значком закладки.' : 'Попробуй другой запрос или поделись первой историей.'}</Empty>}
    <div className="feed-end"><Sparkles /><span>Ты в курсе всего. Теперь можно выдохнуть.</span></div>
    {commentsPost && <Modal title="На одной волне в комментариях" className="comments-sheet" onClose={() => setCommentsId(null)}><p className="comment-context"><span>{commentsPost.text || commentsPost.poll?.question || 'Обсудим эту публикацию'}</span></p><div ref={commentsList} className="comments-list" tabIndex={0} aria-label="Список комментариев">{commentsPost.comments.map(c => <div className="comment-row" key={c.id}><Avatar person={c.avatar} size="small" /><div><strong>{c.author}</strong><p>{c.text}</p></div></div>)}{!commentsPost.comments.length && <Empty title="Начни разговор">Твоё сообщение может стать первым.</Empty>}</div><form className="message-input" onSubmit={e => { e.preventDefault(); if (!comment.trim()) return; onUpdate({ ...commentsPost, comments: [...commentsPost.comments, { id: crypto.randomUUID(), author: profile.name, avatar: 'sasha', text: comment.trim() }] }); setComment('') }}><input aria-label="Комментарий" maxLength={500} value={comment} onChange={e => setComment(e.target.value)} placeholder="Напиши что-нибудь хорошее…" /><button className="send-button" aria-label="Отправить комментарий" disabled={!comment.trim()}><Send /></button></form></Modal>}
    {orderOpen && <Modal title="Порядок публикаций" onClose={() => setOrderOpen(false)}><div className="action-list feed-order-options">{feedOrders.map(item => <button key={item.id} aria-pressed={currentOrder.id === item.id} onClick={() => { setOrder(item.id); setOrderOpen(false) }}><span><strong>{item.label}</strong><small>{item.description}</small></span>{currentOrder.id === item.id && <Check />}</button>)}</div></Modal>}
    {menuPost && <Modal title="Публикация" onClose={() => setMenuId(null)}><div className="action-list"><button onClick={() => { onUpdate({ ...menuPost, saved: !menuPost.saved }); setMenuId(null); notify(menuPost.saved ? 'Убрано из сохранённого' : 'Сохранено') }}><Bookmark /><span>{menuPost.saved ? 'Убрать из сохранённого' : 'Сохранить на потом'}</span></button><button onClick={() => { setMenuId(null); notify('Демо: жалоба отмечена. Реальной отправки нет.') }}><Shield /><span>Пожаловаться на публикацию</span></button></div></Modal>}
    {community && <Modal title={community === 'class' ? `Это наш ${profile.className}` : 'Пятница после уроков'} onClose={() => setCommunity(null)}>{community === 'class' ? <><div className="community-detail"><div className="class-avatar">{profile.className}</div><h3>{profile.school}</h3><p>28 ребят, много историй и одно расписание.</p><div className="avatar-stack"><Avatar person="masha" /><Avatar person="artem" /><Avatar person="dasha" /><Avatar /></div></div><div className="soft-note">Здесь можно спрашивать, помогать и быть собой. Бережно относимся друг к другу.</div></> : <><PicnicArt /><div className="event-details"><Tag color="orange">2 октября · 15:30</Tag><h3>Какао, пледы и свои люди</h3><p>Встречаемся у входа в парк после уроков. Бери тёплую кофту и хорошее настроение.</p><button className="button primary full" onClick={() => { setCommunity(null); notify('Ты в списке! Увидимся в пятницу ☕') }}>Я с вами</button></div></>}</Modal>}
  </>
}
