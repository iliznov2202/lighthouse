import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'
const storageKey = 'mayak-theme-v1'
export function readTheme(): ThemePreference {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch { return 'system' }
}
function applyTheme(preference: ThemePreference) {
  const dark = preference === 'dark' || (preference === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171923' : '#ffffff')
}
applyTheme(readTheme())

const ThemeContext = createContext<{ preference: ThemePreference; setPreference: (value: ThemePreference) => void }>({ preference: 'system', setPreference: () => {} })
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readTheme)
  useEffect(() => {
    applyTheme(preference)
    try { localStorage.setItem(storageKey, preference) } catch { /* Theme works without storage. */ }
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme(preference)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [preference])
  return <ThemeContext.Provider value={{ preference, setPreference }}>{children}</ThemeContext.Provider>
}
export function ThemePicker() {
  const { preference, setPreference } = useContext(ThemeContext)
  return <fieldset className="theme-setting"><legend>Тема оформления</legend><p>Как на устройстве или по твоему выбору.</p><div className="theme-options">{([{ value: 'system', label: 'Системная' }, { value: 'light', label: 'Светлая' }, { value: 'dark', label: 'Тёмная' }] as const).map(option => <label key={option.value}><input type="radio" name="theme" value={option.value} checked={preference === option.value} onChange={() => setPreference(option.value)} /><span>{option.label}</span></label>)}</div></fieldset>
}
