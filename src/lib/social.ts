import type { Poll, Post, Reaction } from '../types'

export const reactionTypes: { id: Reaction; label: string }[] = [
  { id: 'heart', label: 'Нравится' },
  { id: 'laugh', label: 'Смешно' },
  { id: 'fire', label: 'Огонь' },
  { id: 'support', label: 'Поддерживаю' },
  { id: 'wow', label: 'Вау' },
]

// Old demo posts retain their existing likes when reactions are first used.
export function reactionCounts(post: Post): Partial<Record<Reaction, number>> {
  return post.reactions ?? { heart: post.likes }
}
export function selectedReaction(post: Post): Reaction | null {
  return post.reaction !== undefined ? post.reaction : post.liked ? 'heart' : null
}
export function reactToPost(post: Post, chosen: Reaction): Post {
  const counts = { ...reactionCounts(post) }
  const previous = selectedReaction(post)
  if (previous) counts[previous] = Math.max(0, (counts[previous] ?? 0) - 1)
  const next = previous === chosen ? null : chosen
  if (next) counts[next] = (counts[next] ?? 0) + 1
  return { ...post, reactions: counts, reaction: next, likes: counts.heart ?? 0, liked: next === 'heart' }
}
export function voteInPoll(poll: Poll, optionId: string | null): Poll {
  if (optionId !== null && !poll.options.some(o => o.id === optionId)) return poll
  if (poll.selectedOption === optionId) return poll
  return {
    ...poll,
    selectedOption: optionId,
    options: poll.options.map(option => ({
      ...option,
      votes: Math.max(0, option.votes - (option.id === poll.selectedOption ? 1 : 0) + (option.id === optionId ? 1 : 0)),
    })),
  }
}

// The bounded JPEG keeps local demo posts small and discards camera metadata.
export async function preparePostPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Выбери фото JPG, PNG или WebP.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Одна фотография должна быть не больше 8 МБ.')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw new Error('Не получилось открыть фото. Попробуй другой файл.') }
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Не получилось подготовить фото в этом браузере.')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    let quality = .82
    let data = canvas.toDataURL('image/jpeg', quality)
    while (data.length > 220_000 && quality > .3) {
      quality -= .1
      data = canvas.toDataURL('image/jpeg', quality)
    }
    if (data.length > 280_000) throw new Error('Это фото слишком большое для демо. Выбери фотографию попроще.')
    return data
  } finally { bitmap.close() }
}
