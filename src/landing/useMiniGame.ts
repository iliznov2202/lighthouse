import { useEffect, useReducer } from 'react'

export type GamePhase = 'initial' | 'quiz' | 'stars' | 'interests' | 'completed'
export type Interest = 'quizzes' | 'creativity' | 'games' | 'competitions'
type GameState = { phase: GamePhase; answer: string | null; sparks: number; caught: number; interests: Interest[] }
type Action = { type: 'start' } | { type: 'answer'; answer: string } | { type: 'advance' } | { type: 'catch' } | { type: 'interest'; interest: Interest } | { type: 'finish' } | { type: 'reset' }
const initialState: GameState = { phase: 'initial', answer: null, sparks: 0, caught: 0, interests: [] }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'start': return state.phase === 'initial' ? { ...state, phase: 'quiz' } : state
    case 'answer': return state.phase === 'quiz' && state.answer !== 'Марс' ? { ...state, answer: action.answer, sparks: action.answer === 'Марс' ? 1 : 0 } : state
    case 'advance':
      if (state.phase === 'quiz' && state.answer === 'Марс') return { ...state, phase: 'stars' }
      if (state.phase === 'stars' && state.caught === 3) return { ...state, phase: 'interests' }
      return state
    case 'catch':
      if (state.phase !== 'stars' || state.caught >= 3) return state
      return { ...state, caught: state.caught + 1, sparks: state.caught === 2 ? 2 : state.sparks }
    case 'interest': return state.phase === 'interests' ? { ...state, interests: state.interests.includes(action.interest) ? state.interests.filter(interest => interest !== action.interest) : [...state.interests, action.interest] } : state
    case 'finish': return state.phase === 'interests' && state.interests.length > 0 ? { ...state, phase: 'completed', sparks: 3 } : state
    case 'reset': return initialState
  }
}

export function useMiniGame() {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    if (!(state.phase === 'quiz' && state.answer === 'Марс') && !(state.phase === 'stars' && state.caught === 3)) return
    const timer = window.setTimeout(() => dispatch({ type: 'advance' }), 1000)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.answer, state.caught])
  return { ...state, dispatch }
}
export type MiniGameController = ReturnType<typeof useMiniGame>
