import type { ReactNode } from 'react'

// Shared activity invitation used in the feed and on the first screen.
export default function ActivityCard({ label, kicker, badge, title, description, adornment, children, className = '' }: {
  label: string; kicker: ReactNode; badge: ReactNode; title: string; description: string;
  adornment?: ReactNode; children: ReactNode; className?: string;
}) {
  return <section className={`competition-entry ${className}`} aria-label={label}>
    <div className="competition-entry-top"><span>{kicker}</span>{badge}</div>
    <div className="competition-entry-heading"><div><h2>{title}</h2><p>{description}</p></div>{adornment}</div>
    {children}
  </section>
}
