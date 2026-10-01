import { Component, type ReactNode } from 'react'

export function AppLoading() {
  return <div className="app-loading" role="status" aria-label="Открываем Маяк"><div className="loading-brand">Маяк<span>Открываем твоё пространство…</span></div><div className="loading-skeleton" /><div className="loading-skeleton" /><div className="loading-skeleton" /></div>
}
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="app-loading" role="alert"><div className="loading-brand">Не получилось открыть Маяк</div><p>Проверь подключение и попробуй ещё раз. Сохранённые данные останутся на устройстве.</p><button className="button primary" onClick={() => window.location.reload()}>Повторить</button></div>
    return this.props.children
  }
}
