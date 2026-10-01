import { useState } from 'react'
import { Modal } from '../../../components/ui'
import { demoCredentials } from '../mock'
import { validateAccount } from '../validation'
import type { OnboardingController } from '../useOnboarding'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export default function LoginStep({ controller: c }: { controller: OnboardingController }) {
  const [showPassword, setShowPassword] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  const [sent, setSent] = useState(false)
  return <><StepHeading title="С возвращением" description="Твои люди и планы уже ждут тебя." />
    <form noValidate onSubmit={event => { event.preventDefault(); const errors = validateAccount('user', c.state.email, c.state.password); if (Object.keys(errors).length) c.setErrors(errors); else c.login(c.state.email, c.state.password) }}>
      <label className="field-label" htmlFor="login-email">Email</label><input className="input" id="login-email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={c.state.email} disabled={c.busy} onChange={event => c.patch({ email: event.target.value })} placeholder="sasha@mayak.demo" aria-invalid={Boolean(c.errors.email)} aria-describedby="login-email-error" /><FieldError id="login-email-error">{c.errors.email}</FieldError>
      <label className="field-label" htmlFor="login-password">Пароль</label><div className="registration-password"><input id="login-password" className="input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={128} value={c.state.password} disabled={c.busy} onChange={event => c.patch({ password: event.target.value })} aria-invalid={Boolean(c.errors.password)} aria-describedby="login-password-error" /><button type="button" disabled={c.busy} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Скрыть' : 'Показать'}</button></div><FieldError id="login-password-error">{c.errors.password}</FieldError><FieldError>{c.errors.submit}</FieldError>
      <button className="registration-link" type="button" disabled={c.busy} onClick={() => { setRecoveryEmail(c.state.email); setRecoveryError(''); setSent(false); setRecovery(true) }}>Забыли пароль?</button>
      <PrimaryButton busy={c.busy} disabled={!c.state.email.trim() || !c.state.password}>{c.busy ? 'Входим…' : 'Войти'}</PrimaryButton>
    </form>
    <p className="registration-switch">Первый раз здесь? <button type="button" disabled={c.busy} onClick={() => c.go('account')}>Создать аккаунт</button></p>
    <details className="registration-login-demo"><summary>Данные тестового аккаунта</summary><p>{demoCredentials.email}<br />Пароль: {demoCredentials.password}</p><button className="registration-link" disabled={c.busy} onClick={() => c.patch({ email: demoCredentials.email, password: demoCredentials.password })}>Подставить демо-данные</button></details>
    <p className="registration-local-note">Войди в профиль, сохранённый на этом устройстве.</p>
    {recovery && <Modal title="Восстановим доступ" onClose={() => setRecovery(false)}>{sent ? <><p className="modal-description" role="status">В демонстрации письмо не отправляется. Восстановление доступа появится после подключения аккаунтов.</p><button className="button secondary full" onClick={() => setRecovery(false)}>Вернуться ко входу</button></> : <form noValidate onSubmit={event => { event.preventDefault(); const error = validateAccount('user', recoveryEmail, 'mock-password').email; if (error) setRecoveryError(error); else setSent(true) }}><p className="modal-description">Укажи email, с которым создавал аккаунт.</p><label className="field-label" htmlFor="recovery-email">Email для восстановления</label><input id="recovery-email" className="input" type="email" autoComplete="email" value={recoveryEmail} onChange={event => { setRecoveryEmail(event.target.value); setRecoveryError('') }} /><FieldError>{recoveryError}</FieldError><button className="button primary full" disabled={!recoveryEmail.trim()}>Восстановить доступ</button></form>}</Modal>}
  </>
}
