import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BarChart3, Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, Flame, HandHeart, Heart, Smile, Sparkles, MessageCircle, MoreHorizontal, Shield } from '../design/icons'
import type { Post, Profile, Reaction } from '../types'
import { reactionCounts, reactionTypes, reactToPost, selectedReaction, voteInPoll } from '../lib/social'
import Sticker from './Sticker'
import { Avatar, Modal, PicnicArt, Tag } from './ui'

interface Props {
  onCompetition?: () => void;
  post: Post; profile: Profile; onUpdate: (post: Post) => void;
  onComments: () => void; onMenu: () => void; notify: (message: string) => void
}

export default function SocialPost({ onCompetition, post, profile, onUpdate, onComments, onMenu, notify }: Props) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null)
  const photos = post.photos ?? []
  useEffect(() => {
    if (photoIndex === null) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setPhotoIndex(i => i === null ? null : (i + 1) % photos.length)
      if (event.key === 'ArrowLeft') setPhotoIndex(i => i === null ? null : (i + photos.length - 1) % photos.length)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [photoIndex, photos.length])
  return <article className={`post-card ${post.competitionEventId ? 'competition-system-post' : ''}`}>
    <header className="post-header"><Avatar person={post.avatar} /><div className="post-author"><strong>{post.author}</strong><span>{post.time}<span className="dot-separator">·</span>{post.scope === 'class' ? profile.className : profile.school}</span></div><button className="icon-button" aria-label={`Действия с публикацией ${post.author}`} onClick={onMenu}><MoreHorizontal /></button></header>
    {post.anonymous && <Tag><Shield />Анонимно</Tag>}
    {post.text && <p className="post-text">{post.text}</p>}
    {post.sticker && <div className="post-sticker" data-sticker={post.sticker}><Sticker name={post.sticker} decorative={false} /></div>}
    {post.art && <PicnicArt concert={post.art === 'concert'} />}
    {photos.length > 0 && <div className="post-photo-grid" data-count={photos.length}>{photos.map((photo, index) => <button key={photo.id} aria-label={`Открыть фотографию ${index + 1}`} onClick={() => setPhotoIndex(index)}><img src={photo.src} alt={photo.alt} loading="lazy" /></button>)}</div>}
    {post.poll && <PollCard post={post} onUpdate={onUpdate} />}
    {post.tag && <div className="post-topic"><span>#</span>{post.tag}</div>}
    {post.competitionEventId && <button className="competition-post-cta" onClick={onCompetition}>Участвовать<ArrowRight /></button>}
    <footer className="post-actions">
      <Reactions post={post} onUpdate={onUpdate} />
      <button aria-label={`Комментарии: ${post.author}`} onClick={onComments}><MessageCircle />{post.comments.length || 'Обсудить'}</button>
      <span className="post-action-spacer" />
      <button className={post.saved ? 'saved' : ''} aria-label={post.saved ? 'Убрать из сохранённого' : 'Сохранить публикацию'} aria-pressed={post.saved} onClick={() => { onUpdate({ ...post, saved: !post.saved }); notify(post.saved ? 'Публикация убрана из сохранённого' : 'Публикация сохранена') }}><Bookmark /></button>
    </footer>
    {photoIndex !== null && photos[photoIndex] && <Modal title={`Фото ${photoIndex + 1} из ${photos.length}`} onClose={() => setPhotoIndex(null)} wide><div className="photo-viewer"><img src={photos[photoIndex].src} alt={photos[photoIndex].alt} />{photos.length > 1 && <div className="photo-viewer-controls"><button className="button secondary" aria-label="Предыдущая фотография" onClick={() => setPhotoIndex((photoIndex + photos.length - 1) % photos.length)}><ChevronLeft /></button><span>{photoIndex + 1} / {photos.length}</span><button className="button secondary" aria-label="Следующая фотография" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}><ChevronRight /></button></div>}</div></Modal>}
  </article>
}

const reactionIcons = { heart: Heart, laugh: Smile, fire: Flame, support: HandHeart, wow: Sparkles }
function Reactions({ post, onUpdate }: { post: Post; onUpdate: (post: Post) => void }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const counts = reactionCounts(post)
  const selected = selectedReaction(post)
  const current = reactionTypes.find(r => r.id === selected)
  const SelectedIcon = reactionIcons[selected ?? 'heart']
  const total = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0)
  useEffect(() => {
    if (!open) return
    function outside(event: PointerEvent) { if (!window.matchMedia('(max-width: 760px)').matches && !root.current?.contains(event.target as Node)) setOpen(false) }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus({ preventScroll: true }) } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  function choose(reaction: Reaction) { onUpdate(reactToPost(post, reaction)); setOpen(false); trigger.current?.focus() }
  const label = selected === 'heart' ? 'Убрать лайк' : selected ? `Убрать реакцию ${current?.label}` : 'Нравится'
  return <div className="reaction-control" ref={root}>
    <button className={`reaction-main ${selected ? 'selected' : ''}`} aria-label={`${label}: ${post.author}`} aria-pressed={Boolean(selected)} onClick={() => onUpdate(reactToPost(post, selected ?? 'heart'))}><SelectedIcon /><span>{total}</span></button>
    <button ref={trigger} className="reaction-toggle" aria-label={`Выбрать реакцию: ${post.author}`} aria-expanded={open} onClick={() => setOpen(!open)}><ChevronDown /></button>
    {open && !window.matchMedia('(max-width: 760px)').matches && <div className="reaction-picker" role="group" aria-label="Реакции">{reactionTypes.map(r => { const Icon = reactionIcons[r.id]; return <button key={r.id} aria-label={r.label} title={r.label} aria-pressed={selected === r.id} className={selected === r.id ? 'selected' : ''} onClick={() => choose(r.id)}><Icon /><small>{counts[r.id] || '·'}</small></button> })}</div>}
    {open && window.matchMedia('(max-width: 760px)').matches && <Modal title="Как тебе публикация?" onClose={() => setOpen(false)}><div className="reaction-sheet-options">{reactionTypes.map(r => { const Icon = reactionIcons[r.id]; return <button key={r.id} aria-label={r.label} aria-pressed={selected === r.id} className={selected === r.id ? 'selected' : ''} onClick={() => choose(r.id)}><Icon /><span>{r.label}</span><small>{counts[r.id] || 0}</small></button> })}</div></Modal>}
  </div>
}

function PollCard({ post, onUpdate }: { post: Post; onUpdate: (post: Post) => void }) {
  const poll = post.poll!
  const total = poll.options.reduce((sum, option) => sum + option.votes, 0)
  const voted = poll.selectedOption !== null
  const votesWord = new Intl.PluralRules('ru').select(total)
  return <section className="poll-card" aria-label={`Опрос: ${poll.question}`}>
    <div className="poll-kicker"><BarChart3 /><span>НА ОДНОЙ ВОЛНЕ</span><span>Опрос</span></div>
    <h3>{poll.question}</h3>
    <div className="poll-vote-options">{poll.options.map(option => {
      const percent = total ? Math.round(option.votes / total * 100) : 0
      const selected = poll.selectedOption === option.id
      return <button key={option.id} className={`${voted ? 'has-results' : ''} ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => onUpdate({ ...post, poll: voteInPoll(poll, option.id) })}>
        {voted && <span className="poll-bar" style={{ width: `${percent}%` }} />}
        <span className="poll-option-label">{selected && <Check />}{option.text}</span>
        {voted ? <strong>{percent}%</strong> : <span className="poll-radio" />}
      </button>
    })}</div>
    <div className="poll-footer"><span>{total} {votesWord === 'one' ? 'голос' : votesWord === 'few' ? 'голоса' : 'голосов'}</span>{voted ? <button onClick={() => onUpdate({ ...post, poll: voteInPoll(poll, null) })}>Отменить голос</button> : <span>Выбери один вариант</span>}</div>
  </section>
}
