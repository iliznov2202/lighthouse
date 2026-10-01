import { chromium } from '@playwright/test'
import fs from 'node:fs'
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true })
try {
  const page = await browser.newPage()
  const svg = fs.readFileSync('public/icons/app.svg', 'utf8')
  for (const size of [192, 512]) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${svg}`)
    await page.screenshot({ path: `public/icons/app-${size}.png` })
  }
} finally { await browser.close() }
