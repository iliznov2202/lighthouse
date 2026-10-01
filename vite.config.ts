import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pwaPlugin } from './scripts/pwa-plugin'

export default defineConfig({
  plugins: [react(), pwaPlugin()],
  base: process.env.VITE_BASE_PATH || '/',
})
