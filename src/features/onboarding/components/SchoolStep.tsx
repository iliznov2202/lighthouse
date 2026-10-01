import { useState } from 'react'
import { Check, GraduationCap, MapPin, Search } from '../../../design/icons'
import { registrationSchools } from '../mock'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export interface SchoolStepProps { schoolId: string; query: string; busy?: boolean; error?: string; onSelect: (id: string) => void; onQuery: (query: string) => void; onNext: () => void }
export default function SchoolStep({ schoolId, query, busy, error, onSelect, onQuery, onNext }: SchoolStepProps) {
  const [info, setInfo] = useState(false)
  const visible = registrationSchools.filter(school => `${school.name} ${school.city}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const selected = registrationSchools.find(school => school.id === schoolId)
  return <><StepHeading title="Где ты учишься?" description="Найди школу — и свои будут рядом." />
    <label className="search-field registration-search"><Search /><input aria-label="Найти школу" placeholder="Название, номер или город" value={query} disabled={busy} onChange={event => { onQuery(event.target.value); setInfo(false) }} /></label>
    <div className="registration-schools" role="group" aria-label="Школы">{visible.map(school => <button key={school.id} type="button" className={`registration-school ${school.id === schoolId ? 'selected' : ''}`} aria-pressed={school.id === schoolId} disabled={busy} onClick={() => onSelect(school.id)}><span className="feature-icon blue"><GraduationCap /></span><span><strong>{school.name}</strong><small><MapPin />{school.city}</small></span>{school.id === schoolId && <Check />}</button>)}{!visible.length && <div className="registration-empty" role="status"><strong>Школа не найдена</strong><p>Попробуй другое название, номер или город.</p></div>}</div>
    {selected && !visible.some(school => school.id === schoolId) && <p className="registration-hint">Выбрана: {selected.name} · {selected.city}</p>}
    <FieldError>{error}</FieldError>
    <PrimaryButton type="button" disabled={!selected} busy={busy} onClick={onNext}>Это моя школа</PrimaryButton>
    <button className="registration-link" type="button" onClick={() => setInfo(true)}>Не нашёл школу?</button>
    {info && <p className="registration-info" role="status">Добавление новых школ появится позже.</p>}
  </>
}
