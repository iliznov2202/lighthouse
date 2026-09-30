import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './hooks/useTheme'
import '@fontsource-variable/inter'
import './styles.css'
import './theme.css'
import './design/visuals.css'
import './components/notification-preview.css'
import './colors.css'
import './interaction.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ThemeProvider><App /></ThemeProvider></React.StrictMode>,
)
