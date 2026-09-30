import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BarChart3, ImagePlus, LoaderCircle, Plus, Shield, Smile, Trash2, Users, X } from '../design/icons'
import type { Post, PostPhoto, Profile, Scope } from '../types'
import { preparePostPhoto } from '../lib/social'
import { clearPostDraft, emptyPostDraft, readPostDraft, writePostDraft } from '../lib/postDraft'
import Sticker from './Sticker'
import { stickers, stickerNames } from '../design/stickers'
import type { StickerName } from '../design/stickers'
import { Avatar, Modal } from './ui'

interface Props {
  profile: Profile
  onClose: () => void
  onSave: (post: Post) => string | void
  initialMode?: 'post' | 'poll'
}

export default function PostComposer({ profile, onClose, onSave, initialMode = 'post' }: Props) {
  const [initialDraft] = useState(() => readPostDraft(profile))
  const [restored, setRestored] = useState(Boolean(initialDraft))
  const [draftSaved, setDraftSaved] = useState(true)
  const published = useRef(false)
  const [mode, setMode] = useState(initialMode === 'poll' ? 'poll' : initialDraft?.mode ?? initialMode)
  const [text, setText] = useState(initialDraft?.text ?? '')
  const [anonymous, setAnonymous] = useState(initialDraft?.anonymous ?? false)
  const [scope, setScope] = useState<Scope>(initialDraft?.scope ?? 'class')
  const [photos, setPhotos] = useState<PostPhoto[]>(initialDraft?.photos ?? [])
  const [sticker, setSticker] = useState<StickerName | null>(initialDraft?.sticker ?? null)
  const [stickersOpen, setStickersOpen] = useState(false)
  const [question, setQuestion] = useState(initialDraft?.question ?? '')
  const [options, setOptions] = useState(initialDraft?.options ?? ['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const trimmed = options.map(o => o.trim())
  const duplicates = trimmed.some((option, i) => option && trimmed.slice(0, i).some(other => other.toLocaleLowerCase() === option.toLocaleLowerCase()))
  const validPoll = Boolean(question.trim()) && trimmed.length >= 2 && trimmed.every(Boolean) && !duplicates
  const canPublish = !loading && (mode === 'poll' ? validPoll : Boolean(text.trim() || photos.length || sticker))
  const hasContent = Boolean(text.trim() || question.trim() || options.some(option => option.trim()) || photos.length || sticker)

  useEffect(() => {
    if (published.current) return
    setDraftSaved(writePostDraft({ mode, text, anonymous, scope, photos, sticker, question, options, school: profile.school, className: profile.className }))
  }, [mode, text, anonymous, scope, photos, sticker, question, options, profile.school, profile.className])

  function discardDraft() {
    const empty = emptyPostDraft(profile, initialMode)
    setMode(empty.mode); setText(empty.text); setAnonymous(empty.anonymous); setScope(empty.scope)
    setPhotos(empty.photos); setSticker(empty.sticker); setQuestion(empty.question); setOptions(empty.options)
    setError(''); setRestored(false); setStickersOpen(false)
    clearPostDraft()
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length || loading) return
    setError('')
    if (files.length + photos.length > 3) { setError('В одном посте можно прикрепить до трёх фотографий.'); return }
    setLoading(true)
    try {
      const prepared: PostPhoto[] = []
      for (const file of Array.from(files)) prepared.push({ id: crypto.randomUUID(), src: await preparePostPhoto(file), alt: `Фотография ${photos.length + prepared.length + 1}` })
      if (mounted.current) setPhotos(p => [...p, ...prepared])
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'Не получилось добавить фото.')
    } finally {
      if (mounted.current) setLoading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  function publish() {
    if (!canPublish) return
    const post: Post = {
      id: crypto.randomUUID(),
      author: anonymous ? `Кто-то из ${profile.className}` : profile.name,
      avatar: anonymous ? 'anonymous' : 'sasha', color: 'purple', time: 'Только что',
      scope, text: text.trim(), likes: 0, liked: false, saved: false, comments: [], anonymous,
      sticker: sticker ?? undefined,
      photos: photos.length ? photos : undefined,
      poll: mode === 'poll' ? { question: question.trim(), options: trimmed.map(option => ({ id: crypto.randomUUID(), text: option, votes: 0 })), selectedOption: null } : undefined,
    }
    const message = onSave(post)
    if (message) { setError(message); return }
    published.current = true
    clearPostDraft()
  }

  return <Modal title="Твоя новая история" onClose={onClose}>
    <form className="social-composer" onSubmit={e => { e.preventDefault(); publish() }}>
      <div className="composer-author">
        <Avatar person={anonymous ? 'anonymous' : 'sasha'} />
        <div><strong>{anonymous ? `Кто-то из ${profile.className}` : profile.name}</strong>
          <label><Users /><select aria-label="Кому видна публикация" value={scope} onChange={e => setScope(e.target.value as Scope)}>
            <option value="class">Моему классу · {profile.className}</option><option value="school">Всей школе</option>
          </select></label>
        </div>
      </div>
      <div className="composer-segments" aria-label="Формат публикации">
        <button type="button" className={mode === 'post' ? 'active' : ''} aria-pressed={mode === 'post'} onClick={() => setMode('post')}>История</button>
        <button type="button" className={mode === 'poll' ? 'active' : ''} aria-pressed={mode === 'poll'} onClick={() => setMode('poll')}><BarChart3 />Опрос</button>
      </div>
      {hasContent && <div className="composer-draft"><p role="status">{draftSaved ? restored ? 'Черновик восстановлен' : 'Черновик сохранён на этом устройстве' : 'Не удалось сохранить черновик на устройстве'}</p><button type="button" disabled={loading} onClick={discardDraft}>Очистить черновик</button></div>}
      <textarea className="post-textarea" aria-label="Текст публикации" placeholder={mode === 'poll' ? 'Добавь пару слов к опросу, если хочется…' : 'Что у тебя нового? Здесь можно быть собой.'} maxLength={2000} value={text} onChange={e => setText(e.target.value)} />
      <div className="composer-count">{text.length} / 2000</div>
      {mode === 'poll' && <div className="poll-editor">
        <label className="field-label" htmlFor="poll-question">Что спросим у ребят?</label>
        <input id="poll-question" className="input" value={question} maxLength={160} placeholder="Например, куда пойдём в пятницу?" onChange={e => setQuestion(e.target.value)} />
        <span className="field-label">Варианты ответа</span>
        <div className="poll-options-editor">{options.map((option, index) => <div className="poll-option-editor" key={index}>
          <span>{index + 1}</span><input className="input" aria-label={`Вариант ${index + 1}`} maxLength={80} placeholder={index === 0 ? 'В парк за какао ☕' : index === 1 ? 'На школьный концерт 🎸' : 'Ещё одна идея'} value={option} onChange={e => setOptions(o => o.map((v, i) => i === index ? e.target.value : v))} />
          <button type="button" className="icon-button" aria-label={`Удалить вариант ${index + 1}`} disabled={options.length <= 2} onClick={() => setOptions(o => o.filter((_, i) => i !== index))}><Trash2 /></button>
        </div>)}</div>
        {duplicates && <p className="field-error" role="alert">Варианты должны отличаться друг от друга.</p>}
        <button className="text-button poll-add-option" type="button" disabled={options.length >= 6} onClick={() => setOptions(o => [...o, ''])}><Plus />Добавить вариант</button>
        <p className="poll-editor-note">Один голос на человека. Свой выбор можно изменить.</p>
      </div>}
      {photos.length > 0 && <div className="composer-photos">{photos.map((photo, index) => <div key={photo.id}><img src={photo.src} alt={`Прикреплённая фотография ${index + 1}`} /><button type="button" aria-label={`Удалить фотографию ${index + 1}`} onClick={() => setPhotos(p => p.filter(item => item.id !== photo.id))}><X /></button></div>)}</div>}
      {sticker && <div className="composer-sticker-preview"><Sticker name={sticker} decorative={false} /><button type="button" className="icon-button" aria-label="Убрать стикер" onClick={() => setSticker(null)}><X /></button></div>}
      <input ref={fileInput} className="visually-hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label="Фотографии для публикации" onChange={e => void addPhotos(e.target.files)} />
      <div className="composer-tools"><button type="button" disabled={loading || photos.length >= 3} onClick={() => fileInput.current?.click()}>{loading ? <LoaderCircle className="spin" /> : <ImagePlus />}<span>{loading ? 'Готовим фото…' : 'Фотографии'}</span>{photos.length > 0 && <small>{photos.length}/3</small>}</button><button type="button" aria-expanded={stickersOpen} aria-controls="post-sticker-picker" onClick={() => setStickersOpen(!stickersOpen)}><Smile /><span>Стикеры</span></button></div>
      {stickersOpen && <div className="sticker-picker" id="post-sticker-picker" role="group" aria-label="Стикеры Маяка">{stickerNames.map(name => <button key={name} type="button" aria-label={`Стикер: ${stickers[name].label}`} aria-pressed={sticker === name} onClick={() => { setSticker(name); setStickersOpen(false) }}><Sticker name={name} /></button>)}</div>}
      <div className="anonymous-option"><span className="feature-icon purple"><Shield /></span><div><strong>Без имени</strong><p>Имя и аватар не появятся в публикации</p></div><button className={`switch ${anonymous ? 'on' : ''}`} type="button" role="switch" aria-checked={anonymous} aria-label="Анонимная публикация" onClick={() => setAnonymous(!anonymous)}><span /></button></div>
      {anonymous && <div className="soft-note">Анонимность — для честных мыслей. Давай бережно относиться к другим.</div>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="composer-submit"><button className="button primary full" type="submit" disabled={!canPublish}>{mode === 'poll' ? 'Опубликовать опрос' : 'Опубликовать'}<ArrowRight /></button></div>
      <p className="onboarding-footnote">Останется в этом демо на твоём устройстве.</p>
    </form>
  </Modal>
}
