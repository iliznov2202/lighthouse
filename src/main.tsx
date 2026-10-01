import React from 'react'
import ReactDOM from 'react-dom/client'
import SiteApp from './landing/SiteApp'
import { ThemeProvider } from './hooks/useTheme'
import '@fontsource-variable/inter'
import './styles.css'
import './theme.css'
import './colors.css'
import './design/visuals.css'
import './features/competition/competition.css'
import './landing/landing.css'
import './interaction.css'
import './mobile.css'
import { registerPwa } from './lib/pwa'

registerPwa()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ThemeProvider><SiteApp /></ThemeProvider></React.StrictMode>,
)
