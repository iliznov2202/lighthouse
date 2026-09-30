import bestFriends from '../../stickers/best-friends_6995784.svg'
import analysis from '../../stickers/data-analysis_13532192.svg'
import devil from '../../stickers/devil_8073604.svg'
import learning from '../../stickers/elearning_12873165.svg'
import friends from '../../stickers/friends_11117146.svg'
import geography from '../../stickers/geography_5928177.svg'
import goal from '../../stickers/goal_11621982.svg'
import knitting from '../../stickers/knitting_10078274.svg'
import love from '../../stickers/love_9444252.svg'
import map from '../../stickers/map_5389846.svg'
import maths from '../../stickers/maths_11020940.svg'
import medal from '../../stickers/medal_10790353.svg'
import morning from '../../stickers/morning_8047042.svg'
import news from '../../stickers/newspaper_11474091.svg'
import plane from '../../stickers/paper-plane_8136631.svg'
import note from '../../stickers/post-it_8136646.svg'
import presentation from '../../stickers/presentation_8876328.svg'
import protest from '../../stickers/protest_5064589.svg'
import sport from '../../stickers/push-ups_11117792.svg'
import school from '../../stickers/school-time_10296210.svg'
import scientist from '../../stickers/scientist_8545314.svg'
import umbrella from '../../stickers/umbrella_8533484.svg'

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
