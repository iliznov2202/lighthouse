import { demoCredentials, demoUser, findClass, occupiedUsernames, registrationClasses, registrationSchools } from './mock'
import { ageOn, normalizeUsername, validateAccount, validateBirthDate, validateUsername } from './validation'
import type { MockUser, OnboardingGateway, RegistrationInput } from './types'

const accountsKey = 'mayak-mock-accounts-v1'
export const mockSessionKey = 'mayak-mock-user-v1'
const pendingKey = 'mayak-registration-pending-v1'
interface AccountRecord { user: MockUser; salt: string; passwordDigest: string }
export class OnboardingError extends Error {
  constructor(message: string, public field = 'submit') { super(message) }
}
function readAccounts(): AccountRecord[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(accountsKey) ?? '[]')
    return Array.isArray(value) ? value.filter((record): record is AccountRecord => Boolean(record?.user?.id && record.user.email && record.user.profile?.name && typeof record.salt === 'string' && typeof record.passwordDigest === 'string')) : []
  } catch { return [] }
}
export function readPendingRegistration(): MockUser | null {
  try { const id = localStorage.getItem(pendingKey); return readAccounts().find(record => record.user.id === id)?.user ?? null } catch { return null }
}
export function saveMockSession(user: MockUser) {
  localStorage.setItem(mockSessionKey, JSON.stringify(user))
}
export function clearPendingRegistration() { try { localStorage.removeItem(pendingKey) } catch { /* Optional storage cleanup. */ } }
export function resetMockRegistration() {
  for (const key of [accountsKey, mockSessionKey, pendingKey]) { try { localStorage.removeItem(key) } catch { /* Optional storage cleanup. */ } }
}
// This credential check is only a local mock. Real authentication replaces this adapter.
async function passwordDigest(password: string, salt: string) {
  const data = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))
  return Array.from(new Uint8Array(data), byte => byte.toString(16).padStart(2, '0')).join('')
}
const delay = () => new Promise<void>(resolve => window.setTimeout(resolve, 450))
function checkEmail(email: string, exceptUserId?: string) {
  if (email.trim().toLowerCase() === demoCredentials.email || readAccounts().some(record => record.user.id !== exceptUserId && record.user.email === email.trim().toLowerCase())) throw new OnboardingError('Этот email уже зарегистрирован. Попробуй войти.', 'email')
}
function checkUsername(username: string, exceptUserId?: string) {
  const value = normalizeUsername(username)
  if (occupiedUsernames.includes(value) || readAccounts().some(record => record.user.id !== exceptUserId && record.user.profile.username === value)) throw new OnboardingError('Этот username уже занят. Попробуй другой.', 'username')
}
function createUser(input: RegistrationInput): MockUser {
  const school = registrationSchools.find(item => item.id === input.schoolId)
  if (!school || ![8, 9, 10, 11].includes(input.grade) || !['А', 'Б', 'В', 'Г'].includes(input.letter)) throw new OnboardingError('Выбери школу и класс.', 'submit')
  const schoolClass = findClass(school.id, input.grade, input.letter)
  return { id: input.existingUserId ?? crypto.randomUUID(), email: input.email.trim().toLowerCase(), birthDate: input.birthDate,
    acceptedRulesAt: new Date().toISOString(), safetyMode: ageOn(input.birthDate) < 18 ? 'teen' : 'standard',
    profile: { name: input.name.trim(), username: normalizeUsername(input.username), avatarUrl: input.avatarUrl, school: school.name, city: school.city, schoolId: school.id, classId: schoolClass.id, className: `${input.grade}${input.letter}`, bio: 'Новые люди, идеи и планы. На одной волне.' } }
}
export const mockOnboardingGateway: OnboardingGateway = {
  async checkEmail(email, exceptUserId) { await delay(); checkEmail(email, exceptUserId) },
  async checkUsername(username, exceptUserId) { await delay(); checkUsername(username, exceptUserId) },
  async resolveInvitation(code) {
    await delay()
    const item = registrationClasses.find(schoolClass => schoolClass.inviteCode === code.trim().toUpperCase())
    if (!item) throw new OnboardingError('Не нашли такой код. Проверь его или уточни у одноклассника.', 'inviteCode')
    return item
  },
  async register(input) {
    await delay()
    const records = readAccounts()
    const existing = records.find(record => record.user.id === input.existingUserId)
    if (input.existingUserId && (readPendingRegistration()?.id !== input.existingUserId || !existing)) throw new OnboardingError('Начни регистрацию заново.')
    const errors = validateAccount(input.name, input.email, input.password || (existing ? 'existing-password' : ''))
    const firstError = Object.entries(errors)[0]
    if (firstError) throw new OnboardingError(firstError[1], firstError[0])
    const [year, month, day] = input.birthDate.split('-')
    const birthError = validateBirthDate({ year, month, day })
    if (birthError) throw new OnboardingError(birthError, 'birth')
    if (ageOn(input.birthDate) < 14) throw new OnboardingError('Маяк пока доступен с 14 лет.', 'birth')
    const usernameError = validateUsername(input.username)
    if (usernameError) throw new OnboardingError(usernameError, 'username')
    if (!input.acceptedRules) throw new OnboardingError('Прими правила сообщества.', 'rules')
    checkEmail(input.email, input.existingUserId); checkUsername(input.username, input.existingUserId)
    const user = createUser(input)
    const salt = input.password || !existing ? crypto.randomUUID() : existing.salt
    const record = { user, salt, passwordDigest: input.password || !existing ? await passwordDigest(input.password, salt) : existing.passwordDigest }
    let previousPending: string | null = null
    try {
      previousPending = localStorage.getItem(pendingKey)
      localStorage.setItem(pendingKey, user.id)
      localStorage.setItem(accountsKey, JSON.stringify([...records.filter(item => item.user.id !== user.id), record]))
    } catch {
      try { if (previousPending) localStorage.setItem(pendingKey, previousPending); else localStorage.removeItem(pendingKey) } catch { /* Keep the form usable when storage is full. */ }
      throw new OnboardingError('Браузер не смог сохранить аккаунт. Проверь свободное место или доступ к локальному хранению.')
    }
    return user
  },
  async login(email, password) {
    await delay()
    const value = email.trim().toLowerCase()
    if (value === demoCredentials.email && password === demoCredentials.password) return structuredClone(demoUser)
    const record = readAccounts().find(item => item.user.email === value)
    if (!record || await passwordDigest(password, record.salt) !== record.passwordDigest) throw new OnboardingError('Email или пароль не подошли. Проверь данные и попробуй ещё раз.')
    return structuredClone(record.user)
  },
}
