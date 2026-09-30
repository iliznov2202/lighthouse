export interface QuizQuestion {
  id: string
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
}
export interface Quiz { id: string; title: string; topic: string; questions: QuizQuestion[] }
export interface QuizAnswer { questionId: string; optionId: string }
export interface QuizResult {
  eventId: string; quizId: string; studentId: string; classId: string; answers: QuizAnswer[];
  correct: number; total: number; personalPoints: number; classPoints: number;
  positionBefore: number; positionAfter: number; completedAt: string
}
export interface StudentRanking { studentId: string; classId: string; name: string; points: number }
export interface ClassRanking { classId: string; schoolId: string; name: string; points: number; participants: number; members: number }
export interface RankedClass extends ClassRanking { position: number; movement: number }
export interface RankedStudent extends StudentRanking { position: number }
export type CompetitionPhase = 'active' | 'last-day' | 'finished'
export interface CompetitionEvent {
  id: string; quizId: string; title: string; schoolId: string; endsAt: string; referenceTime: string;
  scoring: { personalPerCorrect: number; classPerCorrect: number }
}
export interface CompetitionAttempt { classId?: string; className?: string; answers: QuizAnswer[]; result: QuizResult | null; phase: CompetitionPhase }
export type CompetitionView = 'quiz' | 'result' | 'ranking' | null
