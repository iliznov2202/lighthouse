import type { Profile } from '../../types'

export type RegistrationStep = 'account' | 'birth' | 'school' | 'class' | 'profile' | 'rules'
export type OnboardingView = RegistrationStep | 'login' | 'age-restricted' | 'invite-confirm' | 'welcome'
export interface School { id: string; name: string; city: string }
export interface SchoolClass { id: string; schoolId: string; grade: number; letter: string; members: number; inviteCode?: string }
export interface BirthDate { day: string; month: string; year: string }
export interface OnboardingState {
  view: OnboardingView
  name: string
  displayName: string
  email: string
  password: string
  birth: BirthDate
  schoolId: string
  schoolQuery: string
  grade: number | null
  letter: string
  inviteCode: string
  invitation: SchoolClass | null
  username: string
  usernameEdited: boolean
  avatarUrl?: string
  acceptedRules: boolean
}
export type FormErrors = Record<string, string>
export interface MockUser {
  id: string
  email: string
  birthDate: string
  profile: Profile
  acceptedRulesAt: string
  safetyMode: 'teen' | 'standard'
}
export interface RegistrationInput { name: string; email: string; password: string; birthDate: string; schoolId: string; grade: number; letter: string; username: string; avatarUrl?: string; acceptedRules: boolean; existingUserId?: string }
export interface OnboardingGateway {
  checkEmail(email: string, exceptUserId?: string): Promise<void>
  checkUsername(username: string, exceptUserId?: string): Promise<void>
  resolveInvitation(code: string): Promise<SchoolClass>
  register(input: RegistrationInput): Promise<MockUser>
  login(email: string, password: string): Promise<MockUser>
}
export type CompleteOnboarding = (profile: Profile, user?: MockUser, newRegistration?: boolean) => void | Promise<void>
