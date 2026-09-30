import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Check, Sparkles, X } from 'lucide-react'
import { subjects } from '../data/mock'
import type { Subject } from '../types'

export function Lighthouse({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 160 150" className={`lighthouse ${className}`} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}tower`} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#34cef4" /><stop offset=".45" stopColor="#653cff" /><stop offset="1" stopColor="#f28ad6" /></linearGradient>
      <linearGradient id={`${id}beam`}><stop stopColor="#ffd275" stopOpacity=".9" /><stop offset="1" stopColor="#ffe6a7" stopOpacity="0" /></linearGradient>
      <linearGradient id={`${id}wave`}><stop stopColor="#4ee0ef" /><stop offset=".5" stopColor="#536aff" /><stop offset="1" stopColor="#e59df6" /></linearGradient>
    </defs>
    <path d="M68 27 88 11l22 16H68Z" fill={`url(#${id}tower)`} />
    <path d="m75 45-17 66c18-4 37 16 61 8l-18-74Z" fill={`url(#${id}tower)`} />
    <path d="M72 27h34v22H72Z" fill={`url(#${id}tower)`} />
    <path d="M79 29h20v14H79Z" fill="#fff7d6" />
    <path d="m90 32 70-20v62L90 40Z" fill={`url(#${id}beam)`} />
    <path d="M73 61c8-9 21-12 32-8l5 17c-12-9-25-11-40 7Z" fill="#c59fff" opacity=".7" />
    <path d="M7 120c27-62 62-20 89-6 25 13 41 6 53-6-14 40-47 40-76 24-26-14-43-16-66-12Z" fill={`url(#${id}wave)`} />
    <path d="M7 120c34-30 58 13 94 9 22-2 36-8 48-21-15 18-38 17-62 5-29-14-56-9-80 7Z" fill="#75d8ff" opacity=".5" />
  </svg>
}
export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}><Lighthouse /><span>Маяк<span className="brand-dot">.</span></span></div>
}
export function Avatar({ person = 'sasha', size = '', className = '' }: { person?: string; size?: 'small' | 'large' | ''; className?: string }) {
  const colors: Record<string, string> = { sasha: '#dae1ff', masha: '#f9dbe6', artem: '#d9e9f3', dasha: '#dbecda', club: '#ffead1', anonymous: '#ebe5ff' }
  const bg = colors[person] || '#e8e2fa'
  return <span className={`avatar ${size} ${className}`} style={{ background: bg }} aria-hidden="true">
    {person === 'anonymous' ? <span className="anon-face">✦</span> : person === 'club' ? <span>🎸</span> : <svg viewBox="0 0 48 48">
      <path d="M8 48c0-13 8-17 16-17s16 4 16 17" fill={person === 'masha' ? '#b679a8' : person === 'dasha' ? '#6b947c' : '#737db9'} />
      <ellipse cx="24" cy="21" rx="12" ry="14" fill="#f2c4a3" />
      {person === 'masha' || person === 'dasha' ? <path d="M12 30C5 9 13 5 25 5c12 0 17 14 11 28l-4-12c-7 0-12-4-14-9-1 7-4 11-6 18Z" fill={person === 'masha' ? '#6d473e' : '#8a533e'} /> : <path d="M12 20C9 8 17 4 24 5c11-4 17 7 12 16l-4-9c-4 5-11 4-17 2Z" fill="#403343" />}
      <circle cx="20" cy="22" r="1" fill="#413142" /><circle cx="29" cy="22" r="1" fill="#413142" /><path d="M21 28q4 3 7-1" fill="none" stroke="#ad6e65" strokeWidth="1.4" strokeLinecap="round" />
    </svg>}
  </span>
}
export function Tag({ children, color = 'purple' }: { children: ReactNode; color?: string }) { return <span className={`tag ${color}`}>{children}</span> }
export function SubjectIcon({ subject }: { subject: Subject }) { return <span className={`subject-icon ${subjects[subject].color}`}>{subjects[subject].icon}</span> }
export function Empty({ title, children }: { title: string; children?: ReactNode }) { return <div className="empty-state"><span>✧</span><h3>{title}</h3><p>{children}</p></div> }
export function SectionTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="section-title"><h2>{title}</h2>{action && <button className="text-button" onClick={onClick}>{action}<ArrowRight size={15} /></button>}</div> }
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeRef.current()
      if (event.key === 'Tab') {
        const items = box.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea, select, [tabindex="0"]')
        if (!items?.length) return
        const first = items[0]; const last = items[items.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === box.current)) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [])
  return <div className="modal-backdrop" onClick={onClose}><div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} ref={box} tabIndex={-1} onClick={e => e.stopPropagation()}><div className="modal-handle" /><header className="modal-header"><h2>{title}</h2><button className="icon-button" aria-label="Закрыть" onClick={onClose}><X size={21} /></button></header>{children}</div></div>
}
export function Toast({ message }: { message: string }) { return <div className="toast" role="status"><Check size={18} />{message}</div> }
export function DemoLabel({ children = 'Демо-режим' }: { children?: ReactNode }) { return <span className="demo-label"><Sparkles size={12} />{children}</span> }
export function PicnicArt({ concert = false }: { concert?: boolean }) {
  if (concert) return <div className="concert-art"><div className="concert-kicker">ШКОЛА № 57 PRESENTS</div><strong>Твой звук.<br />Твоя сцена.</strong><span className="concert-guitar">🎸</span><div className="concert-footer">ОТКРЫТЫЙ МИКРОФОН <span>ПТ · 16:00</span></div><span className="concert-star">✳</span></div>
  return <div className="picnic-art"><svg viewBox="0 0 620 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="parkSky" x2="0" y2="1"><stop stopColor="#dfe9ec" /><stop offset="1" stopColor="#f6e8d1" /></linearGradient><linearGradient id="parkLake" x2="0" y2="1"><stop stopColor="#8fafac" /><stop offset="1" stopColor="#adc5be" /></linearGradient></defs>
    <path fill="url(#parkSky)" d="M0 0h620v260H0Z" /><circle cx="446" cy="75" r="36" fill="#fff4c5" />
    <path d="M0 115q90-28 170 0t160-8 170-3 140 8v148H0Z" fill="#acbaa0" /><path d="M0 154q180-40 345-8t275-7v121H0Z" fill="url(#parkLake)" />
    <path d="M0 208q145-28 279 30t341-24v46H0Z" fill="#c2af88" /><path d="M17 0h8v227h-8Z" fill="#726e59" /><path d="m21 96-49-42M23 72l45-34M24 145l51-46" stroke="#726e59" strokeWidth="6" />
    <g fill="#c68d59"><circle cx="16" cy="27" r="43" /><circle cx="58" cy="28" r="38" /><circle cx="5" cy="89" r="34" /><circle cx="74" cy="74" r="33" /></g>
    <g fill="#d7ab66"><circle cx="104" cy="20" r="39" /><circle cx="39" cy="59" r="34" /><circle cx="83" cy="110" r="24" /></g>
    <path d="m584 0-8 233" stroke="#747d65" strokeWidth="9" /><path d="m582 113-60-69m58 98 51-64" stroke="#747d65" strokeWidth="5" />
    <g fill="#bc824f"><circle cx="573" cy="25" r="54" /><circle cx="621" cy="71" r="55" /><circle cx="540" cy="72" r="35" /></g>
    <g stroke="#d6e0d1" strokeWidth="2" opacity=".8"><path d="M311 172h84m19 12h48m-227 1h43m-62 15h53m212-44h23" /></g>
    <path d="m144 229 76-25 125 31-61 25H175Z" fill="#f4e0c5" /><path d="m168 220 129 31m-89-40 108 25" stroke="#dc937d" strokeWidth="5" />
    <path d="M223 202h22l-3 28h-16Z" fill="#ba795d" /><path d="M219 200h30v5h-30Z" fill="#f4ecd9" /><path d="M259 208h20l-3 26h-14Z" fill="#eee1c5" /><path d="M256 207h26v4h-26Z" fill="#8e6652" />
    <path d="M177 239q-10-16 2-17 14-1 11 18Z" fill="#a2704e" /><g fill="#c78852"><ellipse cx="383" cy="232" rx="8" ry="3" transform="rotate(-25 383 232)" /><ellipse cx="119" cy="205" rx="7" ry="3" transform="rotate(20 119 205)" /></g>
  </svg><div className="picnic-note">после уроков<br /><strong>жизнь тоже есть ☕</strong></div></div>
}
