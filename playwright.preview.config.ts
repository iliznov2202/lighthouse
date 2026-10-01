import { defineConfig } from '@playwright/test'
import config from './playwright.config'

// Verify the production bundle without Vite HMR or other dev-server sessions.
const url = 'http://127.0.0.1:4174'
export default defineConfig({
  ...config,
  outputDir: 'test-results-landing',
  use: { ...config.use, baseURL: url },
  webServer: { command: 'npm run preview -- --port 4174 --strictPort', url, reuseExistingServer: true },
})
