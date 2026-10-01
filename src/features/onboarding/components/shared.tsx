import { LoaderCircle } from '../../../design/icons'
import type { ReactNode } from 'react'

export function StepHeading({ title, description }: { title: string; description?: string }) {
  return <div className="registration-heading"><h1 tabIndex={-1}>{title}</h1>{description && <p>{description}</p>}</div>
}
export function FieldError({ id, children }: { id?: string; children?: string }) { return children ? <p className="registration-error" id={id} role="alert">{children}</p> : null }
export function PrimaryButton({ busy, disabled, children, type = 'submit', onClick }: { busy?: boolean; disabled?: boolean; children: ReactNode; type?: 'button' | 'submit'; onClick?: () => void }) {
  return <button className="button primary full registration-cta" type={type} disabled={disabled || busy} aria-busy={busy || undefined} onClick={onClick}>{busy && <LoaderCircle className="spin" />}{children}</button>
}
