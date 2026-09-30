import type { Post } from '../types'
import { reactionCounts } from './social'

export const feedOrders = [
  { id: 'recent', label: 'Свежее', description: 'Сначала новые публикации' },
  { id: 'popular', label: 'Популярное', description: 'Сначала публикации с большим числом реакций' },
  { id: 'discussed', label: 'Обсуждаемое', description: 'Сначала публикации с большим числом комментариев' },
] as const
export type FeedOrder = typeof feedOrders[number]['id']
export function sortFeedPosts(posts: Post[], order: FeedOrder): Post[] {
  if (order === 'recent') return posts
  const score = (post: Post) => order === 'discussed' ? post.comments.length : Object.values(reactionCounts(post)).reduce((sum, count) => sum + (count ?? 0), 0)
  return posts.map((post, index) => ({ post, index, score: score(post) })).sort((a, b) => b.score - a.score || a.index - b.index).map(item => item.post)
}
