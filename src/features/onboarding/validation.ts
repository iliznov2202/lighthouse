import type { BirthDate, FormErrors } from './types'

export function todayInMoscow(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}
export function validateAccount(name: string, email: string, password: string): FormErrors {
  const errors: FormErrors = {}
  if (!name.trim()) errors.name = 'Как тебя зовут?'
  else if (name.trim().length > 30) errors.name = 'Имя должно быть не длиннее 30 символов.'
  if (!email.trim()) errors.email = 'Введи email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errors.email = 'Проверь email. Например: liza@example.com.'
  if (!password) errors.password = 'Придумай пароль.'
  else if (Array.from(password).length < 8) errors.password = 'В пароле должно быть не меньше 8 символов.'
  return errors
}
export function birthDateISO(birth: BirthDate): string { return `${birth.year}-${birth.month.padStart(2, '0')}-${birth.day.padStart(2, '0')}` }
export function ageOn(birthDate: string, today = todayInMoscow()): number {
  const [year, month, day] = birthDate.split('-').map(Number)
  const [thisYear, thisMonth, thisDay] = today.split('-').map(Number)
  return thisYear - year - (thisMonth < month || (thisMonth === month && thisDay < day) ? 1 : 0)
}
export function validateBirthDate(birth: BirthDate, today = todayInMoscow()): string | null {
  if (!birth.day || !birth.month || !birth.year) return 'Выбери день, месяц и год рождения.'
  const year = Number(birth.year), month = Number(birth.month), day = Number(birth.day)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return 'Такой даты нет. Проверь день и месяц.'
  if (birthDateISO(birth) > today) return 'Дата рождения не может быть в будущем.'
  if (ageOn(birthDateISO(birth), today) > 120) return 'Проверь год рождения.'
  return null
}
export function normalizeUsername(value: string) { return value.trim().replace(/^@/, '').toLowerCase() }
export function validateUsername(value: string): string | null {
  const username = normalizeUsername(value)
  if (!username) return 'Придумай username.'
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(username)) return 'От 3 до 20 символов: латинские буквы, цифры и _. Начни с буквы.'
  return null
}
const transliteration: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
export function suggestUsername(name: string): string {
  const latin = Array.from(name.trim().toLowerCase()).map(char => transliteration[char] ?? char).join('').replace(/[^a-z0-9]/g, '').replace(/^[^a-z]+/, '').slice(0, 13)
  return `${latin || 'student'}_m`
}
