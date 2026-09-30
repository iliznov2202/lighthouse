import { GraduationCap, Heart, MessageCircle, Sparkles } from '../design/icons'
import type { Notice } from '../types'

export const noticeIcons = { comment: MessageCircle, like: Heart, study: GraduationCap, digest: Sparkles }
export const noticeColors = { comment: 'blue', like: 'pink', study: 'orange', digest: 'purple' }
export function noticeCategory(notice: Notice) {
  return notice.kind === 'study' || notice.kind === 'digest' ? 'study' : 'social'
}
