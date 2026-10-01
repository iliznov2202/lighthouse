import { GraduationCap, Users } from '../../../design/icons'
import type { SchoolClass } from '../types'
import { registrationSchools } from '../mock'
import { PrimaryButton, StepHeading } from './shared'

export default function InvitationConfirmStep({ invitation, busy, onConfirm }: { invitation: SchoolClass; busy: boolean; onConfirm: () => void }) {
  const school = registrationSchools.find(item => item.id === invitation.schoolId)!
  return <><StepHeading title={`Это твой ${invitation.grade}${invitation.letter}?`} description="Проверь школу и класс, которые мы нашли по коду." /><div className="registration-invite-confirm"><span className="class-avatar">{invitation.grade}{invitation.letter}</span><h2>{school.name}</h2><p>{school.city}</p><div><GraduationCap />Класс {invitation.grade}{invitation.letter}</div><div><Users />Уже {invitation.members} человек</div></div><PrimaryButton type="button" busy={busy} onClick={onConfirm}>Всё верно, присоединиться</PrimaryButton></>
}
