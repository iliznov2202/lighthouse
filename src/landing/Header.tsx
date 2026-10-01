import { ArrowRight } from '../design/icons'
import { Brand as AppBrand } from '../components/ui'
import { SiteLink } from './router'

export function Brand() {
  return <SiteLink to="/" className="ml-brand-link" aria-label="Маяк — на главную"><AppBrand /></SiteLink>
}
export default function Header() {
  return <header className="ml-header"><div className="ml-container ml-header-inner">
    <Brand /><span className="ml-header-tagline">На одной волне со своими</span>
    <nav aria-label="Аккаунт"><SiteLink to="/login" className="button secondary ml-login-link">Войти</SiteLink><SiteLink to="/register" className="button primary ml-header-register">Регистрация<ArrowRight aria-hidden="true" /></SiteLink></nav>
  </div></header>
}
