import { competitionNoticePost } from '../features/competition/mock'
import type { Homework, Lesson, Notice, Post, Profile, Subject } from '../types'

export const DEMO_DATE = '2026-09-30'
export const defaultProfile: Profile = { name: 'Саша', school: 'Школа № 57', className: '9Б', bio: 'Музыка в наушниках, идеи в голове ✨' }
export const schools = ['Школа № 57', 'Школа № 1535', 'Лицей «Вторая школа»', 'Школа № 179']
export const subjects: Record<Subject, { color: string; teacher: string; room: string }> = {
  'Алгебра': { color: 'purple', teacher: 'Елена Сергеевна', room: '304' },
  'Геометрия': { color: 'purple', teacher: 'Елена Сергеевна', room: '304' },
  'Русский язык': { color: 'blue', teacher: 'Ольга Викторовна', room: '211' },
  'Литература': { color: 'pink', teacher: 'Ольга Викторовна', room: '211' },
  'Английский язык': { color: 'orange', teacher: 'Мария Андреевна', room: '208' },
  'История': { color: 'orange', teacher: 'Дмитрий Павлович', room: '302' },
  'Физика': { color: 'blue', teacher: 'Андрей Игоревич', room: '315' },
  'Химия': { color: 'mint', teacher: 'Наталья Ивановна', room: '312' },
  'Биология': { color: 'mint', teacher: 'Наталья Ивановна', room: '310' },
  'География': { color: 'blue', teacher: 'Ирина Петровна', room: '305' },
  'Информатика': { color: 'purple', teacher: 'Алексей Романович', room: '401' },
  'Физкультура': { color: 'mint', teacher: 'Сергей Алексеевич', room: 'Спортзал' },
}
const times = ['08:30–09:15', '09:25–10:10', '10:30–11:15', '11:25–12:10', '12:30–13:15', '13:25–14:10']
function lessons(names: Subject[]): Lesson[] { return names.map((subject, i) => ({ subject, ...subjects[subject], time: times[i] })) }
export const initialSchedule: Lesson[][] = [
  lessons(['Алгебра', 'Русский язык', 'История', 'Физика', 'Английский язык', 'Физкультура']),
  lessons(['Геометрия', 'Литература', 'Химия', 'Биология', 'Информатика', 'Английский язык']),
  lessons(['Алгебра', 'Русский язык', 'Физика', 'Английский язык', 'История', 'Физкультура']),
  lessons(['Геометрия', 'Химия', 'Русский язык', 'География', 'Литература', 'Информатика']),
  lessons(['Алгебра', 'Английский язык', 'Биология', 'Физика', 'История']),
]
export const initialHomework: Homework[] = [
  { id: 'hw1', subject: 'Алгебра', text: 'Квадратные уравнения: № 245, 247, 250', date: '2026-10-01', minutes: 25, done: false, source: 'Добавила Маша' },
  { id: 'hw2', subject: 'Русский язык', text: 'Упражнение 84. Повторить виды сложных предложений', date: '2026-10-01', minutes: 20, done: false, source: 'Из расписания класса' },
  { id: 'hw3', subject: 'Английский язык', text: 'Student’s book, p. 32, ex. 4–5. Выучить новые слова', date: '2026-10-01', minutes: 15, done: true, source: 'Добавил Артём' },
  { id: 'hw4', subject: 'Физика', text: '§ 8: ускорение. Решить задачи 1–3 после параграфа', date: '2026-10-02', minutes: 30, done: false, source: 'Добавила Даша' },
  { id: 'hw5', subject: 'Литература', text: 'Прочитать главы 1–3 «Капитанской дочки»', date: '2026-10-02', minutes: 40, done: false, source: 'Из расписания класса' },
]
const basePosts: Post[] = [
  { id: 'p1', author: 'Маша Волкова', avatar: 'masha', color: 'pink', time: '25 минут назад', scope: 'class', text: 'Ребят, в пятницу после уроков идём в парк? 🍂\nБерём какао, пледы и просто отдыхаем. Кто с нами?', likes: 18, liked: false, saved: false, comments: [{ id: 'c1', author: 'Артём', avatar: 'artem', text: 'Я за! Только сначала забегу домой за пледом 🙌' }, { id: 'c2', author: 'Даша', avatar: 'dasha', text: 'Берите меня, я принесу печенье' }], tag: 'Планы после уроков', art: 'picnic' },
  { id: 'p2', author: 'Кто-то из 9Б', avatar: 'anonymous', color: 'purple', time: '48 минут назад', scope: 'class', text: 'Это только у меня в голове играет музыка, когда я пытаюсь понять квадратные уравнения? 🫠', likes: 24, liked: true, saved: false, comments: [{ id: 'c3', author: 'Маша', avatar: 'masha', text: 'Теперь у меня тоже 😭' }], anonymous: true },
  { id: 'p3', author: 'Артём Соколов', avatar: 'artem', color: 'blue', time: '1 час назад', scope: 'class', text: 'Нашёл понятное объяснение по физике. Главное: ускорение — это то, как быстро меняется скорость. Сохраняйте, если тоже пропустили этот момент ✌️', likes: 12, liked: false, saved: false, comments: [], tag: 'Помогаем друг другу' },
  { id: 'p4', author: 'Школьный движ', avatar: 'club', color: 'orange', time: 'Сегодня, 10:40', scope: 'school', text: 'Пятница будет громкой 🎸\nОткрытый микрофон в актовом зале! Можно спеть, сыграть или просто прийти поддержать своих. Начало в 16:00.', likes: 42, liked: false, saved: false, comments: [], tag: 'Событие недели', art: 'concert', pinned: true },
  { id: 'p5', author: 'Даша Морозова · 10А', avatar: 'dasha', color: 'mint', time: 'Сегодня, 09:15', scope: 'school', text: 'Собираем команду на школьный квиз. Нужен человек, который знает всё о кино. Ты? Пиши в комментарии 🎬', likes: 16, liked: false, saved: false, comments: [] },
]
export const socialDemoPosts: Post[] = [
  { id: 'demo-poll-v2', author: 'Даша Морозова', avatar: 'dasha', color: 'mint', time: '40 минут назад', scope: 'class', text: 'Пятница близко. Давайте решим вместе ✨', likes: 9, liked: false, saved: false, comments: [], tag: 'Решаем вместе', reactions: { heart: 9, fire: 4, support: 2 }, reaction: null,
    poll: { question: 'Как проведём пятницу после уроков?', options: [{ id: 'park', text: 'В парк за какао ☕', votes: 12 }, { id: 'concert', text: 'На школьный концерт 🎸', votes: 6 }, { id: 'cinema', text: 'Смотреть кино вместе 🍿', votes: 3 }], selectedOption: null } },
  { id: 'demo-photo-v2', author: 'Школьный движ', avatar: 'club', color: 'purple', time: 'Сегодня, 08:30', scope: 'school', text: 'Вот он — наш Маяк 💜\nМесто для своих людей, хороших историй и небольших побед.', likes: 21, liked: false, saved: false, comments: [], photos: [{ id: 'logo-photo', src: `${import.meta.env.BASE_URL}logo-reference.png`, alt: 'Градиентный маяк — логотип нашего приложения' }], reactions: { heart: 21, fire: 5, wow: 7 }, reaction: null },
]
export const initialPosts: Post[] = [basePosts[0], socialDemoPosts[0], ...basePosts.slice(1), socialDemoPosts[1], competitionNoticePost('leader'), competitionNoticePost('top-three')]

export const initialNotices: Notice[] = [
  { id: 'n1', title: 'Маша ответила тебе', text: '«Даа, встречаемся у входа в парк в 15:30!»', time: '10 минут назад', kind: 'comment', read: false },
  { id: 'n2', title: 'Вы на одной волне', text: 'Артём и ещё 5 ребят оценили твою публикацию.', time: '35 минут назад', kind: 'like', read: false },
  { id: 'n3', title: 'Новая домашка по алгебре', text: '№ 245, 247, 250. На завтра — можно начать с малого.', time: '1 час назад', kind: 'study', read: false },
  { id: 'n4', title: 'Твоё утро в двух словах', text: '6 уроков, физика в 315-м и хорошие планы на вечер.', time: 'Сегодня, 07:30', kind: 'digest', read: true },
]
export const tutorReplies = {
  quadratic: 'Давай разберём на примере: x² − 5x + 6 = 0.\n\n1. Найдём дискриминант: D = b² − 4ac = 25 − 24 = 1.\n2. Подставим в формулу: x = (5 ± √1) / 2.\n3. Получаем x₁ = 3 и x₂ = 2.\n\nПроверка: 3² − 5 · 3 + 6 = 0 ✓\n\nПопробуй теперь сам: x² − 7x + 12 = 0. Какие два числа в сумме дают 7, а в произведении — 12?',
  physics: 'Ускорение показывает, как быстро меняется скорость. Формула: a = (v − v₀) / t.\n\nНапример, велосипед разогнался с 0 до 6 м/с за 3 секунды. Тогда a = (6 − 0) / 3 = 2 м/с². Каждую секунду скорость прибавляет 2 м/с.\n\nА если за 4 секунды скорость выросла с 2 до 10 м/с? Попробуй подставить числа.',
  russian: 'Сложное предложение состоит из двух или больше грамматических основ.\n\n«Прозвенел звонок, и ребята вышли в коридор». Основы: «звонок прозвенел» и «ребята вышли». Они равноправны, соединены союзом «и» — это сложносочинённое предложение.\n\n«Когда прозвенел звонок, ребята вышли». Первая часть зависит от второй — это сложноподчинённое.\n\nПопробуй найти основы: «Я открыл окно, потому что стало жарко».',
  fallback: 'Это демо-репетитор: сейчас у меня подготовлены разборы квадратных уравнений, ускорения и сложных предложений.\n\nВыбери одну из тем выше или напиши «квадратные уравнения», «ускорение» или «сложные предложения» — разберём её по шагам.',
}
