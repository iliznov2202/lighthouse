import { useState } from 'react'
import { ArrowLeft } from '../../design/icons'
import { Modal } from '../../components/ui'
import type { Profile } from '../../types'
import { findClass, registrationSchools } from './mock'
import { mockOnboardingGateway } from './service'
import type { SchoolClass } from './types'
import SchoolStep from './components/SchoolStep'
import ClassStep from './components/ClassStep'
import InvitationConfirmStep from './components/InvitationConfirmStep'

export default function CommunityPicker({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (profile: Profile) => void }) {
  const [step, setStep] = useState<'school' | 'class' | 'confirm'>('school')
  const [schoolId, setSchoolId] = useState(profile.schoolId ?? registrationSchools.find(item => item.name === profile.school)?.id ?? '')
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState<number | null>(Number(profile.className.slice(0, -1)))
  const [letter, setLetter] = useState(profile.className.slice(-1))
  const [code, setCode] = useState('')
  const [invitation, setInvitation] = useState<SchoolClass | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  function save(id: string, selectedGrade: number, selectedLetter: string) {
    const school = registrationSchools.find(item => item.id === id)!
    onSave({ ...profile, school: school.name, schoolId: id, city: school.city, classId: findClass(id, selectedGrade, selectedLetter).id, className: `${selectedGrade}${selectedLetter}` })
    onClose()
  }
  async function resolve() {
    if (busy || !code.trim()) return
    setBusy(true); setError('')
    try { setInvitation(await mockOnboardingGateway.resolveInvitation(code)); setStep('confirm') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не получилось проверить код.') }
    finally { setBusy(false) }
  }
  return <Modal title="Моя школа и класс" onClose={onClose}><div className="registration-community">{step !== 'school' && <button className="registration-back" disabled={busy} onClick={() => setStep(step === 'confirm' ? 'class' : 'school')}><ArrowLeft />Назад</button>}
    {step === 'school' && <SchoolStep schoolId={schoolId} query={query} onSelect={setSchoolId} onQuery={setQuery} onNext={() => setStep('class')} />}
    {step === 'class' && <ClassStep schoolId={schoolId} grade={grade} letter={letter} inviteCode={code} busy={busy} errors={{ inviteCode: error }} onGrade={setGrade} onLetter={setLetter} onCode={value => { setCode(value); setError('') }} onNext={() => { if (grade && letter) save(schoolId, grade, letter) }} onInvite={() => void resolve()} />}
    {step === 'confirm' && invitation && <InvitationConfirmStep invitation={invitation} busy={busy} onConfirm={() => save(invitation.schoolId, invitation.grade, invitation.letter)} />}
  </div></Modal>
}
