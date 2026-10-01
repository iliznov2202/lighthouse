import type { HTMLAttributes, ReactNode } from 'react'

export default function RankingRow({ position, avatar, title, detail, points, children, className = '', ...props }: Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  position: number; avatar: ReactNode; title: ReactNode; detail: ReactNode; points: ReactNode;
}) {
  return <div {...props} className={`ranking-row ${className}`}>
    <span className="ranking-position">{position}</span>{avatar}
    <div><strong>{title}</strong><small>{detail}</small></div>
    {children}<strong className="ranking-points">{points}</strong>
  </div>
}
