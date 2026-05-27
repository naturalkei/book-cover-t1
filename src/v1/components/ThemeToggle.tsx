import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@v1/hooks/theme'
import { IconButton } from '@v1/lib/class-names'

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
      className={IconButton}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
