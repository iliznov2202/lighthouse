import { BookOpen, CalendarDays, MessageCircle, Users } from '../../../design/icons'
import Sticker from '../../../components/Sticker'
import { registrationClasses, welcomeContent } from '../mock'
import { todayInMoscow } from '../validation'
import type { MockUser } from '../types'
import { FieldError, PrimaryButton, StepHeading } from './shared'

export default function WelcomeStep({ user, busy, error, onFinish }: { user: MockUser; busy: boolean; error?: string; onFinish: () => void }) {
  const members = registrationClasses.find(item => item.id === user.profile.classId)?.members ?? 0
  const today = todayInMoscow()
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay()
  const lessons = weekday >= 1 && weekday <= 5 ? welcomeContent.weekSchedule[weekday - 1].length : 0
  const assignments = welcomeContent.homework.filter(item => item.date === today).length
  return <><div className="registration-welcome-art"><Sticker name="friends" /></div><StepHeading title={`Добро пожаловать в ${user.profile.className}`} description={`${user.profile.school} · ${user.profile.city}`} />
    <h2 className="registration-summary-title">В классе уже:</h2>
    <div className="registration-summary"><div><Users /><span><strong>{members}</strong> учеников</span></div><div><CalendarDays /><span>Расписание на неделю</span></div><div><BookOpen /><span><strong>{welcomeContent.homework.length}</strong> домашних задания</span></div><div><MessageCircle /><span>Новый пост</span></div></div>
    <div className="registration-today"><span className="eyebrow">ТВОЙ ДЕНЬ ПОД РУКОЙ</span><h2>Сегодня</h2><div><p><strong>{lessons}</strong><span>уроков</span></p><p><strong>{assignments}</strong><span>домашних задания</span></p></div></div>
    <FieldError>{error}</FieldError><PrimaryButton type="button" busy={busy} onClick={onFinish}>{busy ? 'Открываем ленту…' : 'Перейти в ленту'}</PrimaryButton>
  </>
}
