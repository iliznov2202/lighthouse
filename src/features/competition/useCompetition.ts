import { useEffect, useRef } from 'react'
import type { Profile } from '../../types'
import { useStoredState } from '../../hooks/useStoredState'
import { applyClassContribution, gradeQuiz, rankClasses, rankStudents } from './logic'
import type { ClassRanking, CompetitionAttempt, CompetitionEvent, CompetitionPhase, Quiz, QuizResult, StudentRanking } from './types'

export const DEMO_STUDENT_ID = 'current-student'
export function useCompetition(quiz: Quiz, event: CompetitionEvent, profile: Profile, initialClasses: ClassRanking[], finalClasses: ClassRanking[], students: StudentRanking[], newClass: ClassRanking) {
  const [attempts, setAttempts] = useStoredState<Record<string, CompetitionAttempt>>('mayak-competitions-v1', {})
  const attempt: CompetitionAttempt = attempts[event.id] ?? { answers: [], result: null, phase: 'active' }
  const locked = useRef(false)
  useEffect(() => { locked.current = false }, [attempt.answers.length, attempt.phase])
  const className = attempt.className ?? profile.className
  const participantClass = initialClasses.find(c => attempt.classId ? c.classId === attempt.classId : c.name === className) ?? {
    ...newClass, classId: attempt.classId ?? `class-${className}`, schoolId: event.schoolId, name: className,
  }
  const classId = participantClass.classId
  const baseClasses = initialClasses.some(c => c.classId === classId) ? initialClasses : [...initialClasses, participantClass]
  const result = attempt.result
  const final = finalClasses.some(c => c.classId === classId) ? finalClasses : [...finalClasses, ...applyClassContribution([participantClass], result)]
  const rankings = rankClasses(attempt.phase === 'finished' ? final : applyClassContribution(baseClasses, result), baseClasses)
  const mine = rankings.find(c => c.classId === classId)!
  const classmates = students.filter(s => s.classId === classId)
  const studentRankings = rankStudents([...classmates.filter(s => s.studentId !== DEMO_STUDENT_ID), { studentId: DEMO_STUDENT_ID, classId, name: profile.name, points: result?.personalPoints ?? 0 }])

  function answerQuestion(questionId: string, optionId: string): QuizResult | null {
    if (locked.current || result || attempt.phase === 'finished') return null
    const question = quiz.questions[attempt.answers.length]
    if (!question || question.id !== questionId || !question.options.some(o => o.id === optionId)) return null
    locked.current = true
    const answers = [...attempt.answers, { questionId, optionId }]
    const finished = answers.length === quiz.questions.length ? gradeQuiz(quiz, event, answers, baseClasses, classId, DEMO_STUDENT_ID) : null
    setAttempts(current => ({ ...current, [event.id]: { ...attempt, classId, className, answers, result: finished } }))
    return finished
  }
  function setPhase(phase: CompetitionPhase) {
    setAttempts(current => ({ ...current, [event.id]: { ...attempt, phase } }))
  }
  function resetCompetition() { setAttempts({}); locked.current = false }
  return { event, quiz, baseClasses, attempt, result, rankings, studentRankings, mine, classId, answerQuestion, setPhase, resetCompetition }
}
export type CompetitionController = ReturnType<typeof useCompetition>
