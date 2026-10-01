import { createContext, useContext, type AnchorHTMLAttributes } from 'react'

export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
export const routeHref = (path: string) => `${basePath}${path}`
export function currentRoute() {
  const route = window.location.pathname.slice(basePath.length).replace(/\/$/, '') || '/'
  return route === '/' && new URLSearchParams(window.location.search).get('app') === '1' ? '/demo' : route
}
export const NavigationContext = createContext<(path: string) => void>(() => {})
export function SiteLink({ to, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const navigate = useContext(NavigationContext)
  return <a {...props} href={routeHref(to)} onClick={event => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || props.target) return
    event.preventDefault(); navigate(to)
  }} />
}
