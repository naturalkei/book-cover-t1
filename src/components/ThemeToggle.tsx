import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/hooks/theme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={nextLabel}
      data-testid="theme-toggle"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-slate-700 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
