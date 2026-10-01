import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'

export function pwaPlugin(): Plugin {
  let base = '/'
  return {
    name: 'mayak-offline',
    apply: 'build',
    configResolved(config) { base = config.base },
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter(file => file !== 'sw.js')
      const namespace = `mayak-app-${createHash('sha256').update(base).digest('hex').slice(0, 8)}-`
      const version = createHash('sha256').update(files.join('|')).update(String(Date.now())).digest('hex').slice(0, 12)
      const urls = [...new Set([...files.map(file => `${base}${file}`), `${base}index.html`, base, `${base}manifest.webmanifest`, `${base}icons/app-192.png`, `${base}icons/app-512.png`, `${base}logo-reference.png`])]
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `
const CACHE = '${namespace}${version}';
const BASE = ${JSON.stringify(base)};
const URLS = ${JSON.stringify(urls)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS))));
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', event => event.waitUntil(Promise.all([
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('${namespace}') && key !== CACHE).map(key => caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(async response => {
      if (response.ok) return response;
      return (await caches.match(BASE)) || response;
    }).catch(() => caches.match(BASE)));
  } else if (URLS.includes(url.pathname) || url.pathname.startsWith(BASE + 'assets/')) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
` })
    },
  }
}
