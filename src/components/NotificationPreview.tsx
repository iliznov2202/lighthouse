import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, CheckCheck, X } from '../design/icons'
import type { Notice } from '../types'
import { noticeCategory, noticeColors, noticeIcons } from './noticePresentation'
import Sticker from './Sticker'

const categories = [{ id: 'all', label: 'Все' }, { id: 'study', label: 'Учёба' }, { id: 'social', label: 'Общение' }] as const
type Category = typeof categories[number]['id']
interface Props {
  notices: Notice[]
  anchor: RefObject<HTMLButtonElement | null>
  onClose: (restoreFocus?: boolean) => void
  onRead: (id: string) => void
  onReadAll: () => void
  onOpen: (notice: Notice) => void
  onViewAll: () => void
}

export default function NotificationPreview({ notices, anchor, onClose, onRead, onReadAll, onOpen, onViewAll }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onClose })
  callbacks.current = { onClose }
  const [category, setCategory] = useState<Category>('all')
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const placed = position !== null
  const unread = notices.filter(notice => !notice.read).length
  const plural = new Intl.PluralRules('ru').select(unread)
  const unreadLabel = plural === 'one' ? 'новое уведомление' : plural === 'few' ? 'новых уведомления' : 'новых уведомлений'
  const matches = (notice: Notice, filter: Category) => filter === 'all' || noticeCategory(notice) === filter
  const filtered = notices.filter(notice => matches(notice, category))

  useLayoutEffect(() => {
    function place() {
      const rect = anchor.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(470, window.innerWidth - 24)
      const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12))
      setPosition({ top: rect.bottom + 12, left, width })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [anchor])

  useEffect(() => {
    if (!placed) return
    panel.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true })
  }, [placed])

  useEffect(() => {
    function outside(event: PointerEvent) {
      const target = event.target as Node
      if (!panel.current?.contains(target) && !anchor.current?.contains(target)) callbacks.current.onClose(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      callbacks.current.onClose(true)
    }
    function focusOutside(event: FocusEvent) {
      const target = event.target as Node
      if (!panel.current?.contains(target) && !anchor.current?.contains(target)) callbacks.current.onClose(false)
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('keydown', escape)
    document.addEventListener('focusin', focusOutside)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('keydown', escape)
      document.removeEventListener('focusin', focusOutside)
    }
  }, [anchor])

  function moveTab(index: number) {
    const next = (index + categories.length) % categories.length
    setCategory(categories[next].id)
    panel.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return createPortal(<div ref={panel} id="notification-preview" className="notification-preview" role="dialog" aria-modal="false" aria-labelledby="notification-preview-title" style={position ? { ...position, maxHeight: `calc(100dvh - ${position.top + 16}px)` } : { visibility: 'hidden' }}>
    <header className="notification-preview-heading">
      <div><h2 id="notification-preview-title">Уведомления</h2><p aria-live="polite">{unread ? `У тебя ${unread} ${unreadLabel}` : notices.length ? 'Все уведомления прочитаны' : 'Пока без новых событий'}</p></div>
      <button className="icon-button" aria-label="Закрыть окно уведомлений" onClick={() => onClose(true)}><X /></button>
    </header>
    <button className="notification-preview-read-all" disabled={!unread} onClick={() => { onReadAll(); panel.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus() }}><CheckCheck />Отметить все как прочитанные</button>
    <div className="notification-preview-tabs" role="tablist" aria-label="Категории уведомлений">{categories.map((filter, index) => <button key={filter.id} role="tab" aria-selected={category === filter.id} aria-controls="notification-preview-list" tabIndex={category === filter.id ? 0 : -1} onClick={() => setCategory(filter.id)} onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      moveTab(event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1))
    }}>{filter.label}<span>{notices.filter(notice => matches(notice, filter.id)).length}</span>{notices.some(notice => !notice.read && matches(notice, filter.id)) && <i aria-hidden="true" />}</button>)}</div>
    <div className="notification-preview-list" id="notification-preview-list" role="tabpanel" aria-label={categories.find(filter => filter.id === category)?.label}>
      {filtered.slice(0, 5).map(notice => {
        const Icon = noticeIcons[notice.kind]
        return <button key={notice.id} className={`notification-preview-item ${notice.read ? 'read' : 'unread'}`} onClick={() => { onRead(notice.id); onClose(false); onOpen(notice) }}>
          <span className={`feature-icon ${noticeColors[notice.kind]}`}><Icon /></span>
          <span className="notification-preview-content"><strong>{notice.title}</strong><span>{notice.text}</span><small>{notice.time}<span>·</span>{noticeCategory(notice) === 'study' ? 'Учёба' : 'Общение'}</small></span>
          {!notice.read && <span className="notification-preview-unread" aria-label="Новое уведомление" />}
        </button>
      })}
      {!filtered.length && <div className="notification-preview-empty"><Sticker name="plane" /><strong>Здесь пока тихо</strong><p>Новые события появятся в этом окне.</p></div>}
    </div>
    <footer className="notification-preview-footer"><button className="button secondary full" onClick={onViewAll}>Посмотреть все уведомления<ArrowRight /></button></footer>
  </div>, document.body)
}
