import { useEffect, useRef, useState } from 'react'
import { ImagePlus, LoaderCircle } from '../../../design/icons'
import { Avatar } from '../../../components/ui'
import { prepareAvatar } from '../avatar'
import { validateUsername } from '../validation'
import type { OnboardingController } from '../useOnboarding'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export default function ProfileStep({ controller: c }: { controller: OnboardingController }) {
  const { state: s, errors, busy } = c
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  async function upload(file?: File) {
    if (!file || uploading) return
    setUploading(true); setUploadError('')
    try { const avatarUrl = await prepareAvatar(file); if (mounted.current) c.patch({ avatarUrl }) }
    catch (error) { if (mounted.current) setUploadError(error instanceof Error ? error.message : 'Не получилось добавить фото.') }
    finally { if (mounted.current) { setUploading(false); if (input.current) input.current.value = '' } }
  }
  return <><StepHeading title="Как тебя будут видеть в Маяке?" description="Пара штрихов — и твой профиль готов. Фото можно добавить позже." />
    <div className="registration-avatar"><div className="registration-avatar-preview">{s.avatarUrl ? <img src={s.avatarUrl} alt="Твой аватар" /> : <Avatar size="large" />}</div><div><button className="button secondary small-button" type="button" disabled={busy || uploading} onClick={() => input.current?.click()}>{uploading ? <LoaderCircle className="spin" /> : <ImagePlus />}{uploading ? 'Готовим фото…' : s.avatarUrl ? 'Изменить фото' : 'Добавить фото'}</button>{s.avatarUrl && <button className="registration-link" type="button" disabled={busy || uploading} onClick={() => c.patch({ avatarUrl: undefined })}>Убрать фото</button>}<p>JPG, PNG, WebP · до 8 МБ</p></div></div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="visually-hidden" aria-label="Загрузить аватар" disabled={busy || uploading} onChange={event => void upload(event.target.files?.[0])} />
    <FieldError>{uploadError}</FieldError>
    <form noValidate onSubmit={event => { event.preventDefault(); c.profileNext() }}>
      <label className="field-label" htmlFor="registration-display-name">Имя</label><input className="input" id="registration-display-name" autoComplete="nickname" maxLength={30} value={s.displayName} disabled={busy} onChange={event => c.patch({ displayName: event.target.value })} aria-invalid={Boolean(errors.displayName)} aria-describedby="display-name-error" /><FieldError id="display-name-error">{errors.displayName}</FieldError>
      <label className="field-label" htmlFor="registration-username">Username</label><div className="registration-username"><span aria-hidden="true">@</span><input className="input" id="registration-username" autoCapitalize="none" autoComplete="username" spellCheck={false} maxLength={21} placeholder="liza_n" value={s.username} disabled={busy} onChange={event => c.patch({ username: event.target.value.replace(/^@/, ''), usernameEdited: true })} onBlur={() => { const error = validateUsername(s.username); c.setErrors(current => ({ ...current, username: error ?? '' })) }} aria-invalid={Boolean(errors.username)} aria-describedby="username-hint username-error" /></div><p className="registration-hint" id="username-hint">Твоё короткое имя в Маяке. Буквы, цифры и _.</p><FieldError id="username-error">{errors.username}</FieldError><FieldError>{errors.submit}</FieldError>
      <PrimaryButton busy={busy} disabled={uploading || !s.displayName.trim() || !s.username.trim()}>{busy ? 'Проверяем username…' : 'Готово'}</PrimaryButton>
    </form>
    <button className="registration-link" type="button" disabled={busy || uploading} onClick={() => c.profileNext(true)}>Пропустить</button>
  </>
}
