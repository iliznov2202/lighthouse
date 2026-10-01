import { useEffect, useRef } from 'react'
import { ArrowLeft, BookOpen, Heart, Sparkles, Users } from '../../design/icons'
import { Brand, Lighthouse } from '../../components/ui'
import Sticker from '../../components/Sticker'
import { registrationSteps } from './mock'
import type { CompleteOnboarding, RegistrationStep } from './types'
import { useOnboarding } from './useOnboarding'
import RegisterAccountStep from './components/RegisterAccountStep'
import BirthDateStep from './components/BirthDateStep'
import SchoolStep from './components/SchoolStep'
import ClassStep from './components/ClassStep'
import ProfileStep from './components/ProfileStep'
import RulesStep from './components/RulesStep'
import WelcomeStep from './components/WelcomeStep'
import LoginStep from './components/LoginStep'
import AgeRestrictedStep from './components/AgeRestrictedStep'
import InvitationConfirmStep from './components/InvitationConfirmStep'

export default function OnboardingFlow({ onFinish, initialView = 'account', introReward = false, onHome }: { onFinish: CompleteOnboarding; initialView?: 'account' | 'login'; introReward?: boolean; onHome?: () => void }) {
  const c = useOnboarding(onFinish, initialView)
  const view = c.state.view
  const main = useRef<HTMLElement>(null)
  const progressVisible = !['login', 'age-restricted', 'welcome'].includes(view)
  const step = registrationSteps.indexOf((view === 'invite-confirm' ? 'class' : view) as RegistrationStep)
  useEffect(() => { main.current?.querySelector<HTMLHeadingElement>('h1')?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }) }, [view])
  return <div className="registration" data-view={view}>
    <header className="registration-header">{onHome ? <button className="registration-home" aria-label="На главную" onClick={onHome}><Brand /></button> : <Brand />}<span>Сделано для школьника, а не школы</span></header>
    <div className="registration-layout">
      <aside className="registration-visual" aria-hidden="true"><div className="registration-beacon"><div className="registration-orbit" /><Lighthouse /><Sticker name="plane" className="registration-plane" /></div><span className="eyebrow">ТВОЁ МЕСТО. ТВОЙ МАЯК.</span><h2>Свои люди.<br /><span className="gradient-text">Твой ритм.</span></h2><p>Общаться, разбираться с учёбой<br />и оставлять время для себя.</p><div className="registration-benefits"><span><Users />Твой класс рядом</span><span><BookOpen />Учёба под рукой</span><span><Heart />Можно быть собой</span></div></aside>
      <main className="registration-main" ref={main}>
        {introReward && view !== 'login' && <div className="registration-intro-reward" data-testid="intro-reward"><Sparkles aria-hidden="true" /><div><strong>Первое достижение · +30 очков</strong><p>Ты зажёг маяк. Продолжим знакомство.</p></div></div>}
        <div className="registration-stepbar">{view !== 'account' ? <button className="registration-back" type="button" disabled={c.busy} onClick={c.back}><ArrowLeft />Назад</button> : <span />}{progressVisible && <div className="registration-progress" role="progressbar" aria-label="Регистрация" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step + 1} aria-valuetext={`${step + 1} из 6`}><span>{step + 1} из 6</span><div>{registrationSteps.map((item, index) => <i key={item} className={index <= step ? 'active' : ''} />)}</div></div>}</div>
        {view === 'account' && <RegisterAccountStep controller={c} />}
        {view === 'birth' && <BirthDateStep controller={c} />}
        {view === 'school' && <SchoolStep schoolId={c.state.schoolId} query={c.state.schoolQuery} busy={c.busy} error={c.errors.submit} onSelect={schoolId => c.patch({ schoolId })} onQuery={schoolQuery => c.patch({ schoolQuery })} onNext={() => c.go('class')} />}
        {view === 'class' && <ClassStep schoolId={c.state.schoolId} grade={c.state.grade} letter={c.state.letter} inviteCode={c.state.inviteCode} busy={c.busy} errors={c.errors} onGrade={grade => c.patch({ grade })} onLetter={letter => c.patch({ letter })} onCode={inviteCode => c.patch({ inviteCode })} onNext={() => c.go('profile')} onInvite={c.resolveInvitation} />}
        {view === 'invite-confirm' && c.state.invitation && <InvitationConfirmStep invitation={c.state.invitation} busy={c.busy} onConfirm={c.confirmInvitation} />}
        {view === 'profile' && <ProfileStep controller={c} />}
        {view === 'rules' && <RulesStep controller={c} />}
        {view === 'welcome' && c.user && <WelcomeStep user={c.user} busy={c.busy} error={c.errors.submit} onFinish={c.finish} />}
        {view === 'login' && <LoginStep controller={c} />}
        {view === 'age-restricted' && <AgeRestrictedStep onAcknowledge={() => c.go('account')} />}
      </main>
    </div>
    <footer className="registration-footer">Маяк · на одной волне</footer>
  </div>
}
