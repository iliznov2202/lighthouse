import { Users } from '../../../design/icons'
import { findClass, registrationSchools } from '../mock'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export interface ClassStepProps { schoolId: string; grade: number | null; letter: string; inviteCode: string; busy?: boolean; errors?: Record<string, string>; onGrade: (grade: number) => void; onLetter: (letter: string) => void; onCode: (code: string) => void; onNext: () => void; onInvite: () => void }
export default function ClassStep({ schoolId, grade, letter, inviteCode, busy, errors = {}, onGrade, onLetter, onCode, onNext, onInvite }: ClassStepProps) {
  const school = registrationSchools.find(item => item.id === schoolId)
  const schoolClass = grade && letter ? findClass(schoolId, grade, letter) : null
  const className = schoolClass ? `${grade}${letter}` : ''
  return <><StepHeading title="В каком ты классе?" description={school ? `${school.name} · ${school.city}` : 'Выбери параллель и букву класса.'} />
    <div className="registration-class-choices" role="group" aria-label="Параллель">{[8, 9, 10, 11].map(value => <button type="button" key={value} disabled={busy} aria-pressed={grade === value} onClick={() => onGrade(value)}>{value}</button>)}</div>
    {grade !== null && <div className="registration-class-choices letters" role="group" aria-label="Буква класса">{['А', 'Б', 'В', 'Г'].map(value => <button type="button" key={value} disabled={busy} aria-pressed={letter === value} onClick={() => onLetter(value)}>{value}</button>)}</div>}
    {schoolClass && <div className="registration-class-preview" role="status"><span className="class-avatar">{className}</span><div><strong>Твоё пространство — {className}</strong><p><Users />{schoolClass.members ? `В этом классе уже ${schoolClass.members} человек` : 'Ты будешь первым в этом демо-классе'}</p></div></div>}
    <FieldError>{errors.submit}</FieldError><PrimaryButton type="button" busy={busy} disabled={!schoolClass} onClick={onNext}>{className ? `Присоединиться к ${className}` : 'Выбери свой класс'}</PrimaryButton>
    <form className="registration-invite" noValidate onSubmit={event => { event.preventDefault(); onInvite() }}><h2>Есть код класса?</h2><p>Код можно получить у одноклассника.</p><label className="visually-hidden" htmlFor="registration-invite-code">Код класса</label><input className="input" id="registration-invite-code" placeholder="MAYAK-9B-74" autoCapitalize="characters" spellCheck={false} maxLength={32} value={inviteCode} disabled={busy} onChange={event => onCode(event.target.value)} aria-invalid={Boolean(errors.inviteCode)} aria-describedby="invite-error" /><FieldError id="invite-error">{errors.inviteCode}</FieldError><button type="submit" className="button secondary full" disabled={!inviteCode.trim() || busy} aria-busy={busy}>{busy ? 'Проверяем код…' : 'Присоединиться'}</button></form>
  </>
}
