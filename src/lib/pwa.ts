export let waitingWorker: ServiceWorker | null = null
export interface InstallPrompt extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
export let installPrompt: InstallPrompt | null = null
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event as InstallPrompt; window.dispatchEvent(new Event('mayak-install-ready')) })
export function clearInstallPrompt() { installPrompt = null }
export function registerPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) return
  const register = () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).then(registration => {
      function offerUpdate() {
        if (!registration.waiting || !navigator.serviceWorker.controller) return
        waitingWorker = registration.waiting
        window.dispatchEvent(new Event('mayak-update-ready'))
      }
      offerUpdate()
      registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', offerUpdate))
    }).catch(() => { /* Online browsing remains available when installation is blocked. */ })
  }
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
export function applyPwaUpdate() {
  if (!waitingWorker) return
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
}
