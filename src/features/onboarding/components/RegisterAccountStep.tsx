import { useState } from 'react'
import type { OnboardingController } from '../useOnboarding'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export default function RegisterAccountStep({ controller: c }: { controller: OnboardingController }) {
  const [showPassword, setShowPassword] = useState(false)
  const { state: s, errors, busy } = c
  function blur(field: 'name' | 'email' | 'password') {
    const error = c.accountErrors()[field]
    c.setErrors(current => ({ ...current, [field]: error ?? '' }))
  }
  return <>
    <span className="eyebrow">СВОИ ЛЮДИ. ТВОЙ МАЯК.</span>
    <StepHeading title="Твоя школьная жизнь — в одном месте" description="Создай аккаунт, чтобы быть на одной волне со своими." />
    <form noValidate onSubmit={event => { event.preventDefault(); c.accountNext() }} aria-busy={busy}>
      <label className="field-label" htmlFor="register-name">Имя</label>
      <input id="register-name" className="input" autoComplete="given-name" placeholder="Например, Лиза" maxLength={30} value={s.name} disabled={busy} onChange={event => c.patch({ name: event.target.value })} onBlur={() => blur('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-name-error' : undefined} />
      <FieldError id="register-name-error">{errors.name}</FieldError>
      <label className="field-label" htmlFor="register-email">Email</label>
      <input id="register-email" className="input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="liza@example.com" maxLength={254} value={s.email} disabled={busy} onChange={event => c.patch({ email: event.target.value })} onBlur={() => blur('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
      <FieldError id="register-email-error">{errors.email}</FieldError>
      <label className="field-label" htmlFor="register-password">Пароль</label>
      <div className="registration-password"><input id="register-password" className="input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" maxLength={128} placeholder={c.user ? 'Пароль уже задан' : 'Придумай пароль'} value={s.password} disabled={busy} onChange={event => c.patch({ password: event.target.value })} onBlur={() => blur('password')} aria-invalid={Boolean(errors.password)} aria-describedby="register-password-hint register-password-error" /><button type="button" disabled={busy} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Скрыть' : 'Показать'}</button></div>
      <p className="registration-hint" id="register-password-hint">Не меньше 8 символов.</p>
      <FieldError id="register-password-error">{errors.password}</FieldError>
      <FieldError>{errors.submit}</FieldError>
      <PrimaryButton busy={busy} disabled={!s.name.trim() || !s.email.trim() || (!s.password && !c.user)}>{busy ? 'Проверяем данные…' : 'Продолжить'}</PrimaryButton>
    </form>
    <p className="registration-switch">Уже есть аккаунт? <button type="button" disabled={busy} onClick={() => c.go('login')}>Войти</button></p>
    <button className="registration-demo" type="button" disabled={busy} onClick={c.demo}>Заглянуть в демо 9Б</button>
    <p className="registration-local-note">Профиль сохранится на этом устройстве.</p>
  </>
}
