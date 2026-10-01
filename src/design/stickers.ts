import bestFriends from './stickers/bestFriends.svg'
import analysis from './stickers/analysis.svg'
import devil from './stickers/devil.svg'
import learning from './stickers/learning.svg'
import friends from './stickers/friends.svg'
import geography from './stickers/geography.svg'
import goal from './stickers/goal.svg'
import knitting from './stickers/knitting.svg'
import love from './stickers/love.svg'
import map from './stickers/map.svg'
import maths from './stickers/maths.svg'
import medal from './stickers/medal.svg'
import morning from './stickers/morning.svg'
import news from './stickers/news.svg'
import plane from './stickers/plane.svg'
import note from './stickers/note.svg'
import presentation from './stickers/presentation.svg'
import protest from './stickers/protest.svg'
import sport from './stickers/sport.svg'
import school from './stickers/school.svg'
import scientist from './stickers/scientist.svg'
import umbrella from './stickers/umbrella.svg'

export const stickers = {
  bestFriends: { src: bestFriends, label: 'Лучшие друзья' },
  analysis: { src: analysis, label: 'Есть идея' },
  devil: { src: devil, label: 'Хитрый план' },
  learning: { src: learning, label: 'Учимся вместе' },
  friends: { src: friends, label: 'Свои люди' },
  geography: { src: geography, label: 'Весь мир' },
  goal: { src: goal, label: 'В цель' },
  knitting: { src: knitting, label: 'Время для себя' },
  love: { src: love, label: 'С любовью' },
  map: { src: map, label: 'Новый урок' },
  maths: { src: maths, label: 'Математика' },
  medal: { src: medal, label: 'Маленькая победа' },
  morning: { src: morning, label: 'Доброе утро' },
  news: { src: news, label: 'Свежие новости' },
  plane: { src: plane, label: 'На своей волне' },
  note: { src: note, label: 'Не забыть' },
  presentation: { src: presentation, label: 'Покажу идею' },
  protest: { src: protest, label: 'Своё мнение' },
  sport: { src: sport, label: 'Ещё один подход' },
  school: { src: school, label: 'Школьное время' },
  scientist: { src: scientist, label: 'Сейчас разберёмся' },
  umbrella: { src: umbrella, label: 'Любая погода' },
} as const
export type StickerName = keyof typeof stickers
export const stickerNames = Object.keys(stickers) as StickerName[]
