export type Tab = 'feed' | 'study' | 'notifications' | 'profile'
export type StudyTab = 'today' | 'schedule' | 'homework' | 'tutor'
export type Scope = 'class' | 'school'
export type Subject = 'Алгебра' | 'Геометрия' | 'Русский язык' | 'Литература' | 'Английский язык' | 'История' | 'Физика' | 'Химия' | 'Биология' | 'География' | 'Информатика' | 'Физкультура'
export interface Profile { name: string; school: string; className: string; bio: string }
export interface Comment { id: string; author: string; text: string; avatar: string }
export type Reaction = 'heart' | 'laugh' | 'fire' | 'support' | 'wow'
export interface PostPhoto { id: string; src: string; alt: string }
export interface PollOption { id: string; text: string; votes: number }
export interface Poll { question: string; options: PollOption[]; selectedOption: string | null }
export interface Post {
  id: string; author: string; avatar: string; color: string; time: string; scope: Scope;
  text: string; likes: number; liked: boolean; saved: boolean; comments: Comment[];
  anonymous?: boolean; tag?: string; art?: 'picnic' | 'concert'; pinned?: boolean;
  reactions?: Partial<Record<Reaction, number>>; reaction?: Reaction | null; photos?: PostPhoto[]; poll?: Poll; competitionEventId?: string
}
export interface Homework { id: string; subject: Subject; text: string; date: string; minutes: number; done: boolean; source: string }
export interface Lesson { subject: Subject; room: string; teacher: string; time: string }
export interface Notice { id: string; title: string; text: string; time: string; kind: 'comment' | 'like' | 'study' | 'digest'; read: boolean }
export interface ChatMessage { id: string; role: 'assistant' | 'user'; text: string }
