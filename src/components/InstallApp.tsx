import { useEffect, useState } from 'react'
import { applyPwaUpdate, waitingWorker, installPrompt, clearInstallPrompt } from '../lib/pwa'

export function InstallApp() {
  const [prompt, setPrompt] = useState(installPrompt)
  const [instructions, setInstructions] = useState(false)
  const [installed, setInstalled] = useState(() => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  useEffect(() => {
    const ready = () => setPrompt(installPrompt)
    const done = () => { clearInstallPrompt(); setPrompt(null); setInstalled(true) }
    window.addEventListener('mayak-install-ready', ready); window.addEventListener('appinstalled', done)
    return () => { window.removeEventListener('mayak-install-ready', ready); window.removeEventListener('appinstalled', done) }
  }, [])
  if (installed) return null
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
  async function install() {
    if (!prompt) { setInstructions(!instructions); return }
    try { await prompt.prompt(); await prompt.userChoice } catch { setInstructions(true) }
    clearInstallPrompt(); setPrompt(null)
  }
  return <section className="install-card"><h2>Маяк на твоём телефоне</h2><p>Открывай с домашнего экрана. После первого открытия приложение доступно и без интернета.</p><button className="button secondary full" onClick={() => void install()}>{prompt ? 'Установить Маяк' : 'Как добавить на главный экран'}</button>{instructions && <ol>{ios ? <><li>Открой сайт в Safari.</li><li>Нажми «Поделиться».</li><li>Выбери «На экран Домой» → «Добавить».</li></> : <><li>Открой сайт в Chrome или другом браузере с установкой приложений.</li><li>В меню выбери «Установить приложение» или «Добавить на главный экран».</li></>}</ol>}</section>
}

export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [update, setUpdate] = useState(Boolean(waitingWorker))
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine)
    const ready = () => setUpdate(true)
    window.addEventListener('online', connection); window.addEventListener('offline', connection); window.addEventListener('mayak-update-ready', ready)
    return () => { window.removeEventListener('online', connection); window.removeEventListener('offline', connection); window.removeEventListener('mayak-update-ready', ready) }
  }, [])
  if (!online) return <div className="connection-status" role="status"><span>Ты офлайн. Изменения сохраняются на этом устройстве.</span></div>
  if (update) return <div className="connection-status" role="status"><span>Доступна новая версия Маяка</span><button onClick={applyPwaUpdate}>Обновить</button><button aria-label="Обновить позже" onClick={() => setUpdate(false)}>Позже</button></div>
  return null
}
