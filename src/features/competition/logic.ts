import type { Post } from '../../types'
import type { ClassRanking, CompetitionEvent, Quiz, QuizAnswer, QuizResult, RankedClass, RankedStudent, StudentRanking } from './types'

export function rankClasses(classes: ClassRanking[], previous: ClassRanking[] = classes): RankedClass[] {
  const sorted = [...classes].sort((a, b) => b.points - a.points)
  const old = [...previous].sort((a, b) => b.points - a.points)
  return sorted.map(c => {
    const position = sorted.findIndex(other => other.points === c.points) + 1
    const oldClass = old.find(other => other.classId === c.classId)
    const before = oldClass ? old.findIndex(other => other.points === oldClass.points) + 1 : position
    return { ...c, position, movement: before - position }
  })
}
export function applyClassContribution(classes: ClassRanking[], result: QuizResult | null): ClassRanking[] {
  return classes.map(c => result && c.classId === result.classId ? { ...c, points: c.points + result.classPoints, participants: Math.min(c.members, c.participants + 1) } : c)
}
export function rankStudents(students: StudentRanking[]): RankedStudent[] {
  const sorted = [...students].sort((a, b) => b.points - a.points)
  return sorted.map(s => ({ ...s, position: sorted.findIndex(other => other.points === s.points) + 1 }))
}
export function gradeQuiz(quiz: Quiz, event: CompetitionEvent, answers: QuizAnswer[], classes: ClassRanking[], classId: string, studentId: string): QuizResult {
  const validAnswers = quiz.questions.flatMap(question => {
    const answer = answers.find(a => a.questionId === question.id && question.options.some(option => option.id === a.optionId))
    return answer ? [answer] : []
  })
  const correct = quiz.questions.filter(q => validAnswers.some(answer => answer.questionId === q.id && answer.optionId === q.correctOptionId)).length
  const result: QuizResult = {
    eventId: event.id, quizId: quiz.id, studentId, classId, answers: validAnswers, correct, total: quiz.questions.length,
    personalPoints: correct * event.scoring.personalPerCorrect, classPoints: correct * event.scoring.classPerCorrect,
    positionBefore: rankClasses(classes).find(c => c.classId === classId)?.position ?? 0,
    positionAfter: 0, completedAt: new Date().toISOString(),
  }
  result.positionAfter = rankClasses(applyClassContribution(classes, result)).find(c => c.classId === classId)?.position ?? result.positionBefore
  return result
}
export function nextClassGap(classes: RankedClass[], classId: string) {
  const mine = classes.find(c => c.classId === classId)!
  const higher = classes.filter(c => c.points > mine.points).at(-1)
  return higher ? { className: higher.name, position: higher.position, points: higher.points - mine.points } : null
}
export function completionPost(event: CompetitionEvent, result: QuizResult, classes: RankedClass[]): Post {
  const mine = classes.find(c => c.classId === result.classId)!
  const gap = nextClassGap(classes, result.classId)
  const headline = result.positionAfter < result.positionBefore ? `${mine.name} поднялся на ${result.positionAfter} место 🏆` : `${mine.name} добавил ${result.classPoints} очков в командный результат`
  const distance = gap ? `До ${gap.className} осталось всего ${gap.points} очков.` : `${mine.name} сейчас на первом месте. Держим волну!`
  return { id: `${event.id}-result-${result.studentId}`, author: 'Маяк · Битва классов', avatar: 'club', color: 'purple', time: 'Только что', scope: 'school', text: `${headline}\n\n${distance}\nПройди квиз и помоги своему классу подняться выше.`, likes: 0, liked: false, saved: false, comments: [], competitionEventId: event.id }
}
