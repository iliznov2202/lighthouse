import { chromium, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'

const base = process.env.VITE_BASE_PATH || '/'
const root = path.resolve('dist')
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' }
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  if (!pathname.startsWith(base)) { response.writeHead(404); response.end('Not found'); return }
  const relative = pathname.slice(base.length) || 'index.html'
  const file = path.resolve(root, relative)
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return }
  response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
  response.setHeader('Cache-Control', 'no-cache')
  response.end(fs.readFileSync(file))
})
await new Promise(resolve => server.listen(4176, '127.0.0.1', resolve))
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' })
try {
 const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
 const page = await context.newPage()
 const errors = []
 page.on('pageerror', error => errors.push(error.message))
 await page.goto(`http://127.0.0.1:4176${base}`)
 await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), { timeout: 25000 })
 const manifest = await page.evaluate(async () => {
   const url = document.querySelector('link[rel=manifest]').href
   return { data: await (await fetch(url)).json(), url }
 })
 expect(new URL(manifest.data.scope, manifest.url).pathname).toBe(base)
 for (const icon of manifest.data.icons) {
   const response = await page.request.get(new URL(icon.src, manifest.url).href)
   expect(response.status()).toBe(200)
 }
 await page.goto(`http://127.0.0.1:4176${base}demo`)
 await page.getByRole('button', { name: 'Заглянуть в демо 9Б', exact: true }).click()
 await expect(page.locator('.app-header')).toBeVisible()
 await page.screenshot({ path: 'artifacts/mobile-refresh-feed.png' })
 await page.getByRole('button', { name: 'Что нового, Саша?', exact: true }).click()
 await page.getByRole('button', { name: 'Стикеры', exact: true }).click()
 await page.screenshot({ path: 'artifacts/mobile-refresh-stickers.png' })
 await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
 await page.locator('.post-card').first().getByRole('button', { name: /^Комментарии/ }).click()
 await page.screenshot({ path: 'artifacts/mobile-refresh-comments.png' })
 await page.getByRole('button', { name: 'Закрыть', exact: true }).click()
 await context.setOffline(true)
 await page.reload()
 await expect(page.locator('.app-header')).toBeVisible({ timeout: 15000 })
 await expect(page.getByText('Ты офлайн. Изменения сохраняются на этом устройстве.', { exact: true })).toBeVisible()
 await page.getByRole('button', { name: 'Что нового, Саша?', exact: true }).click()
 await page.getByRole('textbox', { name: 'Текст публикации' }).fill('Моя история без интернета')
 await page.getByRole('button', { name: 'Опубликовать', exact: true }).click()
 await expect(page.getByText('Моя история без интернета', { exact: true })).toBeVisible()
 await page.goto(new URL(manifest.data.start_url, manifest.url).href)
 await expect(page.locator('.app-header')).toBeVisible({ timeout: 15000 })
 await expect(page.getByText('Моя история без интернета', { exact: true })).toBeVisible()
 expect(errors).toEqual([])
 console.log('PASS: install manifest, icons, scoped service worker, direct route fallback, offline reload and publication; mobile screenshots saved')
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)) }
