import type { PostPhoto, Profile, Scope } from '../types'
import { stickerNames, type StickerName } from '../design/stickers'

export const postDraftKey = 'mayak-post-draft-v1'
export interface PostDraft {
  mode: 'post' | 'poll'
  text: string
  anonymous: boolean
  scope: Scope
  photos: PostPhoto[]
  sticker: StickerName | null
  question: string
  options: string[]
  school: string
  className: string
}
export function emptyPostDraft(profile: Profile, mode: PostDraft['mode']): PostDraft {
  return { mode, text: '', anonymous: false, scope: 'class', photos: [], sticker: null, question: '', options: ['', ''], school: profile.school, className: profile.className }
}
export function hasPostDraft(draft: PostDraft) {
  return Boolean(draft.text.trim() || draft.question.trim() || draft.options.some(option => option.trim()) || draft.photos.length || draft.sticker)
}
export function readPostDraft(profile: Profile): PostDraft | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(postDraftKey) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const draft = value as PostDraft
    if (draft.school !== profile.school || draft.className !== profile.className || !['post', 'poll'].includes(draft.mode)) return null
    if (typeof draft.text !== 'string' || draft.text.length > 2000 || typeof draft.question !== 'string' || draft.question.length > 160) return null
    if (typeof draft.anonymous !== 'boolean' || !['class', 'school'].includes(draft.scope)) return null
    if (!Array.isArray(draft.options) || draft.options.length < 2 || draft.options.length > 6 || draft.options.some(option => typeof option !== 'string' || option.length > 80)) return null
    if (draft.sticker !== null && !stickerNames.includes(draft.sticker)) return null
    if (!Array.isArray(draft.photos) || draft.photos.length > 3 || draft.photos.some(photo => !photo || typeof photo.id !== 'string' || typeof photo.alt !== 'string' || typeof photo.src !== 'string' || photo.src.length > 280_000 || !photo.src.startsWith('data:image/jpeg;base64,'))) return null
    return hasPostDraft(draft) ? draft : null
  } catch { return null }
}
export function writePostDraft(draft: PostDraft): boolean {
  try {
    if (hasPostDraft(draft)) localStorage.setItem(postDraftKey, JSON.stringify(draft))
    else localStorage.removeItem(postDraftKey)
    return true
  } catch { return false }
}
export function clearPostDraft() {
  try { localStorage.removeItem(postDraftKey) } catch { /* Drafts are optional when storage is unavailable. */ }
}
