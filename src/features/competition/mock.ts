import type { Post } from '../../types'
import type { ClassRanking, CompetitionEvent, Quiz, StudentRanking } from './types'

export const knowledgeQuiz: Quiz = {
  id: 'general-knowledge-01', title: 'Общие знания', topic: 'Общие знания',
  questions: [
    { id: 'q1', prompt: 'Какой город — столица Австралии?', options: [{ id: 'a', text: 'Сидней' }, { id: 'b', text: 'Канберра' }, { id: 'c', text: 'Мельбурн' }, { id: 'd', text: 'Перт' }], correctOptionId: 'b' },
    { id: 'q2', prompt: 'Какая планета находится ближе всего к Солнцу?', options: [{ id: 'a', text: 'Венера' }, { id: 'b', text: 'Земля' }, { id: 'c', text: 'Марс' }, { id: 'd', text: 'Меркурий' }], correctOptionId: 'd' },
    { id: 'q3', prompt: 'Сколько сторон у шестиугольника?', options: [{ id: 'a', text: 'Пять' }, { id: 'b', text: 'Восемь' }, { id: 'c', text: 'Шесть' }, { id: 'd', text: 'Семь' }], correctOptionId: 'c' },
    { id: 'q4', prompt: 'Кто написал «Евгения Онегина»?', options: [{ id: 'a', text: 'Александр Пушкин' }, { id: 'b', text: 'Михаил Лермонтов' }, { id: 'c', text: 'Лев Толстой' }, { id: 'd', text: 'Николай Гоголь' }], correctOptionId: 'a' },
    { id: 'q5', prompt: 'Какая химическая формула у воды?', options: [{ id: 'a', text: 'CO₂' }, { id: 'b', text: 'O₂' }, { id: 'c', text: 'NaCl' }, { id: 'd', text: 'H₂O' }], correctOptionId: 'd' },
    { id: 'q6', prompt: 'Какой океан самый большой по площади?', options: [{ id: 'a', text: 'Атлантический' }, { id: 'b', text: 'Тихий' }, { id: 'c', text: 'Индийский' }, { id: 'd', text: 'Северный Ледовитый' }], correctOptionId: 'b' },
    { id: 'q7', prompt: 'Как записывается число 5 в двоичной системе?', options: [{ id: 'a', text: '101' }, { id: 'b', text: '110' }, { id: 'c', text: '111' }, { id: 'd', text: '100' }], correctOptionId: 'a' },
    { id: 'q8', prompt: 'В каких единицах измеряется энергия в системе СИ?', options: [{ id: 'a', text: 'В ваттах' }, { id: 'b', text: 'В ньютонах' }, { id: 'c', text: 'В джоулях' }, { id: 'd', text: 'В паскалях' }], correctOptionId: 'c' },
    { id: 'q9', prompt: 'На каком материке находится Бразилия?', options: [{ id: 'a', text: 'Африка' }, { id: 'b', text: 'Южная Америка' }, { id: 'c', text: 'Северная Америка' }, { id: 'd', text: 'Евразия' }], correctOptionId: 'b' },
    { id: 'q10', prompt: 'Что такое RAM в компьютере?', options: [{ id: 'a', text: 'Видеокарта' }, { id: 'b', text: 'Процессор' }, { id: 'c', text: 'Жёсткий диск' }, { id: 'd', text: 'Оперативная память' }], correctOptionId: 'd' },
  ],
}
export const weeklyCompetition: CompetitionEvent = {
  id: 'class-battle-2026-w40', quizId: knowledgeQuiz.id, title: 'Битва классов: Общие знания', schoolId: 'school-57',
  endsAt: '2026-10-02T20:00:00+03:00', referenceTime: '2026-09-30T20:00:00+03:00',
  scoring: { personalPerCorrect: 100, classPerCorrect: 1 },
}
export const initialClassRankings: ClassRanking[] = [
  { classId: 'class-10a', schoolId: 'school-57', name: '10А', points: 184, participants: 23, members: 30 },
  { classId: 'class-8b', schoolId: 'school-57', name: '8Б', points: 171, participants: 22, members: 29 },
  { classId: 'class-9a', schoolId: 'school-57', name: '9А', points: 161, participants: 21, members: 28 },
  { classId: 'class-9b', schoolId: 'school-57', name: '9Б', points: 157, participants: 19, members: 28 },
  { classId: 'class-10b', schoolId: 'school-57', name: '10Б', points: 138, participants: 18, members: 27 },
]
export const finalClassRankings: ClassRanking[] = initialClassRankings.map(c => ({
  ...c, points: ({ 'class-10a': 214, 'class-9b': 205, 'class-8b': 199, 'class-9a': 181, 'class-10b': 160 } as Record<string, number>)[c.classId], participants: c.members - 2,
}))
export const initialStudentRankings: StudentRanking[] = [
  { studentId: 'anya', classId: 'class-9b', name: 'Аня', points: 980 },
  { studentId: 'maxim', classId: 'class-9b', name: 'Максим', points: 900 },
  { studentId: 'sasha-demo', classId: 'class-9b', name: 'Саша', points: 700 },
]
export function competitionNoticePost(kind: 'leader' | 'last-day' | 'top-three'): Post {
  const texts = {
    leader: '8Б вышел на первое место\nБитва только набирает обороты. Кто сможет догнать ребят?',
    'last-day': 'До конца квиза осталось 24 часа\nЕщё есть время принести очки своему классу. Один квиз — десять вопросов.',
    'top-three': '9Б вошёл в топ-3\nКомандные победы начинаются с небольшого вклада каждого.',
  }
  return { id: `${weeklyCompetition.id}-${kind}`, author: 'Маяк · Битва классов', avatar: 'club', color: 'purple', time: kind === 'last-day' ? 'Только что' : 'Ранее на этой неделе', scope: 'school', text: texts[kind], likes: kind === 'leader' ? 17 : 12, liked: false, saved: false, comments: [], competitionEventId: weeklyCompetition.id }
}
