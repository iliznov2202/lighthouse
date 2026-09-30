import { stickers } from '../design/stickers'
import type { StickerName } from '../design/stickers'

export default function Sticker({ name, className = '', decorative = true }: { name: StickerName; className?: string; decorative?: boolean }) {
  const sticker = stickers[name]
  if (!sticker) return null
  return <img className={`mayak-sticker ${className}`} src={sticker.src} width={80} height={80} alt={decorative ? '' : sticker.label} aria-hidden={decorative || undefined} draggable={false} decoding="async" />
}
