import { useCallback, useEffect, useState } from 'react'

export type TTheme = 'light' | 'dark'

const STORAGE_KEY = 'book-flip-showcase:theme'

const detectInitialTheme = (): TTheme => {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  }
  catch {
    /* ignore storage errors (private mode, disabled storage) */
  }
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

const applyTheme = (theme: TTheme): void => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
}

export function applyInitialTheme(): void {
  applyTheme(detectInitialTheme())
}

export function useTheme() {
  const [theme, setThemeState] = useState<TTheme>(() => detectInitialTheme())

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
    catch {
      /* ignore storage errors */
    }
  }, [theme])

  const setTheme = useCallback((next: TTheme) => setThemeState(next), [])
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
