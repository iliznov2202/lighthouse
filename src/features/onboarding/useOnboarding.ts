import { useEffect, useRef, useState } from 'react'
import { defaultProfile } from '../../data/mock'
import { demoUser, registrationSteps } from './mock'
import { mockOnboardingGateway, OnboardingError, readPendingRegistration } from './service'
import { ageOn, birthDateISO, normalizeUsername, suggestUsername, validateAccount, validateBirthDate, validateUsername } from './validation'
import type { CompleteOnboarding, FormErrors, OnboardingGateway, OnboardingState, RegistrationInput } from './types'

function initialState(initialView: 'account' | 'login'): OnboardingState {
  const user = readPendingRegistration()
  const [year = '', month = '', day = ''] = user?.birthDate.split('-') ?? []
  const className = user?.profile.className ?? ''
  return { view: initialView === 'login' ? 'login' : user ? 'welcome' : 'account', name: user?.profile.name ?? '', displayName: user?.profile.name ?? '', email: user?.email ?? '', password: '', birth: { day: day ? String(Number(day)) : '', month: month ? String(Number(month)) : '', year }, schoolId: user?.profile.schoolId ?? '', schoolQuery: '', grade: className ? Number(className.slice(0, -1)) : null, letter: className.slice(-1), inviteCode: '', invitation: null, username: user?.profile.username ?? '', usernameEdited: Boolean(user), avatarUrl: user?.profile.avatarUrl, acceptedRules: Boolean(user) }
}
export function useOnboarding(onFinish: CompleteOnboarding, initialView: 'account' | 'login' = 'account', gateway: OnboardingGateway = mockOnboardingGateway) {
  const [state, setState] = useState(() => initialState(initialView))
  const [user, setUser] = useState(readPendingRegistration)
  const [errors, setErrors] = useState<FormErrors>({})
  const [busy, setBusy] = useState(false)
  const running = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  function patch(update: Partial<OnboardingState>) {
    if (running.current) return
    setState(current => {
      const next = { ...current, ...update }
      if (update.name !== undefined && (!current.displayName || current.displayName === current.name)) next.displayName = update.name
      if ((update.name !== undefined || update.displayName !== undefined) && !current.usernameEdited) next.username = suggestUsername(next.displayName || next.name)
      return next
    })
    setErrors(current => Object.fromEntries(Object.entries(current).filter(([key]) => !(key in update) && key !== 'submit')))
  }
  function go(view: OnboardingState['view']) { if (!running.current) { setState(current => ({ ...current, view })); setErrors({}) } }
  async function run(job: () => Promise<void>) {
    if (running.current) return
    running.current = true; setBusy(true); setErrors({})
    try { await job() } catch (error) {
      if (mounted.current) {
        const field = error instanceof OnboardingError ? error.field : 'submit'
        setErrors({ [field]: error instanceof Error ? error.message : 'Не получилось продолжить. Попробуй ещё раз.' })
        setState(current => {
          if (current.view !== 'rules') return current
          const view = ['name', 'email', 'password'].includes(field) ? 'account' : field === 'birth' ? 'birth' : ['displayName', 'username'].includes(field) ? 'profile' : current.view
          return { ...current, view }
        })
      }
    } finally { running.current = false; if (mounted.current) setBusy(false) }
  }
  function accountErrors() { return validateAccount(state.name, state.email, state.password || (user ? 'existing-password' : '')) }
  function accountNext() {
    const validation = accountErrors()
    if (Object.keys(validation).length) { setErrors(validation); return }
    void run(async () => { await gateway.checkEmail(state.email, user?.id); if (mounted.current) setState(current => ({ ...current, view: 'birth' })) })
  }
  function birthNext() {
    const error = validateBirthDate(state.birth)
    if (error) { setErrors({ birth: error }); return }
    go(ageOn(birthDateISO(state.birth)) < 14 ? 'age-restricted' : 'school')
  }
  function resolveInvitation() {
    if (!state.inviteCode.trim()) { setErrors({ inviteCode: 'Введи код класса.' }); return }
    void run(async () => { const invitation = await gateway.resolveInvitation(state.inviteCode); if (mounted.current) setState(current => ({ ...current, invitation, view: 'invite-confirm' })) })
  }
  function confirmInvitation() {
    if (!state.invitation) return
    patch({ schoolId: state.invitation.schoolId, grade: state.invitation.grade, letter: state.invitation.letter, view: 'profile' })
  }
  function profileNext(skip = false) {
    const name = skip ? state.name.trim() : state.displayName.trim()
    if (!name) { setErrors({ displayName: 'Как тебя будут видеть ребята?' }); return }
    const username = skip ? suggestUsername(state.name) : normalizeUsername(state.username)
    const error = validateUsername(username)
    if (error) { setErrors({ username: error }); return }
    void run(async () => {
      let candidate = username
      if (skip) {
        for (let attempt = 0; ; attempt++) {
          try { await gateway.checkUsername(candidate, user?.id); break } catch (error) {
            if (!(error instanceof OnboardingError) || error.field !== 'username' || attempt >= 20) throw error
            candidate = `${username.slice(0, 16)}_${attempt + 2}`
          }
        }
      } else await gateway.checkUsername(candidate, user?.id)
      if (mounted.current) setState(current => ({ ...current, displayName: name, username: candidate, avatarUrl: skip ? undefined : current.avatarUrl, view: 'rules' }))
    })
  }
  function input(): RegistrationInput | null {
    if (!state.grade || !state.letter || !state.schoolId) { setErrors({ submit: 'Выбери школу и класс.' }); return null }
    return { name: state.displayName, email: state.email, password: state.password, birthDate: birthDateISO(state.birth), schoolId: state.schoolId, grade: state.grade, letter: state.letter, username: state.username, avatarUrl: state.avatarUrl, acceptedRules: state.acceptedRules, existingUserId: user?.id }
  }
  function register() {
    if (!state.acceptedRules) return
    const registration = input()
    if (!registration) return
    void run(async () => { const created = await gateway.register(registration); if (mounted.current) { setUser(created); setState(current => ({ ...current, view: 'welcome' })) } })
  }
  function finish() { if (user) void run(async () => { await onFinish(user.profile, user, true) }) }
  function login(email: string, password: string) { void run(async () => { const current = await gateway.login(email, password); await onFinish(current.profile, current, false) }) }
  function demo() { void run(async () => { await onFinish(defaultProfile, demoUser, false) }) }
  function back() {
    if (state.view === 'welcome') go('rules')
    else if (state.view === 'invite-confirm' || state.view === 'profile') go('class')
    else if (state.view === 'login') go('account')
    else if (state.view === 'age-restricted') go('birth')
    else { const index = registrationSteps.indexOf(state.view); if (index > 0) go(registrationSteps[index - 1]) }
  }
  return { state, user, errors, busy, patch, go, back, accountNext, birthNext, resolveInvitation, confirmInvitation, profileNext, register, finish, login, demo, setErrors, accountErrors }
}
export type OnboardingController = ReturnType<typeof useOnboarding>
