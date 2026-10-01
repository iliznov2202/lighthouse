import { monthNames } from '../mock'
import { todayInMoscow } from '../validation'
import type { OnboardingController } from '../useOnboarding'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export default function BirthDateStep({ controller: c }: { controller: OnboardingController }) {
  const { state: s, errors, busy } = c
  const year = Number(todayInMoscow().slice(0, 4))
  function update(field: 'day' | 'month' | 'year', value: string) { c.patch({ birth: { ...s.birth, [field]: value } }) }
  return <><StepHeading title="Когда ты родился?" description="Это нужно, чтобы настроить безопасный режим приложения." />
    <form noValidate onSubmit={event => { event.preventDefault(); c.birthNext() }}>
      <div className="registration-birth-fields">
        <label><span className="field-label">День</span><select className="input" aria-label="День" autoComplete="bday-day" value={s.birth.day} onChange={event => update('day', event.target.value)} aria-invalid={Boolean(errors.birth)} aria-describedby={errors.birth ? 'birth-error' : undefined}><option value="">День</option>{Array.from({ length: 31 }, (_, index) => <option key={index + 1} value={String(index + 1)}>{index + 1}</option>)}</select></label>
        <label><span className="field-label">Месяц</span><select className="input" aria-label="Месяц" autoComplete="bday-month" value={s.birth.month} onChange={event => update('month', event.target.value)} aria-invalid={Boolean(errors.birth)} aria-describedby={errors.birth ? 'birth-error' : undefined}><option value="">Месяц</option>{monthNames.map((month, index) => <option key={month} value={String(index + 1)}>{month}</option>)}</select></label>
        <label><span className="field-label">Год</span><select className="input" aria-label="Год" autoComplete="bday-year" value={s.birth.year} onChange={event => update('year', event.target.value)} aria-invalid={Boolean(errors.birth)} aria-describedby={errors.birth ? 'birth-error' : undefined}><option value="">Год</option>{Array.from({ length: 121 }, (_, index) => <option key={year - index} value={String(year - index)}>{year - index}</option>)}</select></label>
      </div>
      <FieldError id="birth-error">{errors.birth}</FieldError><FieldError>{errors.submit}</FieldError>
      <PrimaryButton busy={busy} disabled={!s.birth.day || !s.birth.month || !s.birth.year}>Продолжить</PrimaryButton>
    </form></>
}
