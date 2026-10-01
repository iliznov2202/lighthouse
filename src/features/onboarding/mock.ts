import { defaultProfile, initialHomework, initialSchedule } from '../../data/mock'
import type { School, SchoolClass, MockUser } from './types'
import type { Profile } from '../../types'

export const registrationSchools: School[] = [
  { id: 'school-123', name: 'ГБОУ школа №123', city: 'Санкт-Петербург' },
  { id: 'school-57', name: 'Школа № 57', city: 'Москва' },
  { id: 'school-1535', name: 'Школа № 1535', city: 'Москва' },
  { id: 'school-2', name: 'Лицей «Вторая школа»', city: 'Москва' },
  { id: 'school-179', name: 'Школа № 179', city: 'Москва' },
]
export const registrationClasses: SchoolClass[] = [
  { id: '123-8Б', schoolId: 'school-123', grade: 8, letter: 'Б', members: 21 },
  { id: '123-9А', schoolId: 'school-123', grade: 9, letter: 'А', members: 23 },
  { id: '123-9Б', schoolId: 'school-123', grade: 9, letter: 'Б', members: 18, inviteCode: 'MAYAK-9B-74' },
  { id: '123-10А', schoolId: 'school-123', grade: 10, letter: 'А', members: 20 },
  { id: '123-10Б', schoolId: 'school-123', grade: 10, letter: 'Б', members: 19, inviteCode: 'MAYAK-10B-21' },
  { id: '57-9Б', schoolId: 'school-57', grade: 9, letter: 'Б', members: 28, inviteCode: 'MAYAK-9B-57' },
  { id: '57-9А', schoolId: 'school-57', grade: 9, letter: 'А', members: 25 },
  { id: '1535-10А', schoolId: 'school-1535', grade: 10, letter: 'А', members: 22, inviteCode: 'MAYAK-10A-35' },
  { id: '2-11В', schoolId: 'school-2', grade: 11, letter: 'В', members: 17 },
  { id: '179-8А', schoolId: 'school-179', grade: 8, letter: 'А', members: 24 },
]
export const occupiedUsernames = ['liza_n', 'sasha', 'anya', 'maxim', 'mayak', 'admin']
export const demoCredentials = { email: 'sasha@mayak.demo', password: 'Mayak2026' }
export const demoUser: MockUser = { id: 'demo-sasha', email: demoCredentials.email, birthDate: '2011-04-18', profile: { ...defaultProfile, username: 'sasha', schoolId: 'school-57', classId: '57-9Б', city: 'Москва' }, acceptedRulesAt: '2026-09-30T09:00:00+03:00', safetyMode: 'teen' }
export const registrationSteps = ['account', 'birth', 'school', 'class', 'profile', 'rules'] as const
export const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
export const communityRules = ['Уважать других', 'Не публиковать чужие личные данные', 'Не выдавать себя за другого человека', 'Не травить и не угрожать', 'Помнить: анонимные публикации не анонимны для модерации']
export const firstVisitHomework = initialHomework.slice(0, 4).map(item => ({ ...item, done: false }))
export const welcomeContent = { weekSchedule: initialSchedule, homework: firstVisitHomework, newPosts: 1 }
export function findClass(schoolId: string, grade: number, letter: string): SchoolClass {
  return registrationClasses.find(item => item.schoolId === schoolId && item.grade === grade && item.letter === letter) ?? { id: `${schoolId}-${grade}${letter}`, schoolId, grade, letter, members: 0 }
}
export function classMembers(profile: Profile) {
  const school = registrationSchools.find(item => item.id === profile.schoolId || item.name === profile.school)
  return school ? findClass(school.id, Number(profile.className.slice(0, -1)), profile.className.slice(-1)).members : 0
}
