import { useEffect, useRef } from 'react'
import type { Profile } from '../../types'
import { useStoredState } from '../../hooks/useStoredState'
import { applyClassContribution, gradeQuiz, rankClasses, rankStudents } from './logic'
import type { ClassRanking, CompetitionAttempt, CompetitionEvent, CompetitionPhase, Quiz, QuizResult, StudentRanking } from './types'

export const DEMO_STUDENT_ID = 'current-student'
export function useCompetition(quiz: Quiz, event: CompetitionEvent, profile: Profile, initialClasses: ClassRanking[], finalClasses: ClassRanking[], students: StudentRanking[]) {
  const [attempts, setAttempts] = useStoredState<Record<string, CompetitionAttempt>>('mayak-competitions-v1', {})
  const attempt = attempts[event.id] ?? { answers: [], result: null, phase: 'active' }
  const locked = useRef(false)
  useEffect(() => { locked.current = false }, [attempt.answers.length, attempt.phase])
  const participantClass = initialClasses.find(c => c.name === profile.className) ?? {
    classId: `class-${profile.className}`, schoolId: event.schoolId, name: profile.className, points: 157, participants: 19, members: 28,
  }
  const classId = participantClass.classId
  const baseClasses = initialClasses.some(c => c.classId === classId) ? initialClasses : [...initialClasses, participantClass]
  const result = attempt.result
  const final = finalClasses.some(c => c.classId === classId) ? finalClasses : [...finalClasses, { ...participantClass, points: 205, participants: 26 }]
  const rankings = rankClasses(attempt.phase === 'finished' ? final : applyClassContribution(baseClasses, result), baseClasses)
  const mine = rankings.find(c => c.classId === classId)!
  const classmates = students.some(s => s.classId === classId) ? students.filter(s => s.classId === classId) : students.map(s => ({ ...s, classId }))
  const studentRankings = rankStudents([...classmates.filter(s => s.studentId !== DEMO_STUDENT_ID), { studentId: DEMO_STUDENT_ID, classId, name: profile.name, points: result?.personalPoints ?? 0 }])

  function answerQuestion(questionId: string, optionId: string): QuizResult | null {
    if (locked.current || result || attempt.phase === 'finished') return null
    const question = quiz.questions[attempt.answers.length]
    if (!question || question.id !== questionId || !question.options.some(o => o.id === optionId)) return null
    locked.current = true
    const answers = [...attempt.answers, { questionId, optionId }]
    const finished = answers.length === quiz.questions.length ? gradeQuiz(quiz, event, answers, baseClasses, classId, DEMO_STUDENT_ID) : null
    setAttempts(current => ({ ...current, [event.id]: { ...attempt, answers, result: finished } }))
    return finished
  }
  function setPhase(phase: CompetitionPhase) {
    setAttempts(current => ({ ...current, [event.id]: { ...attempt, phase } }))
  }
  function resetCompetition() { setAttempts({}); locked.current = false }
  return { event, quiz, baseClasses, attempt, result, rankings, studentRankings, mine, classId, answerQuestion, setPhase, resetCompetition }
}
export type CompetitionController = ReturnType<typeof useCompetition>
