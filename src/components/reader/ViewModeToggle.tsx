import { BookOpen, FileText } from 'lucide-react'

import type { ViewMode } from '@/hooks/view-mode'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (next: ViewMode) => void
  className?: string
}

interface Option {
  id: ViewMode
  label: string
  Icon: typeof BookOpen
  description: string
}

const OPTIONS: Option[] = [
  { id: 'single', label: 'Single', Icon: FileText, description: 'One page at a time' },
  { id: 'spread', label: 'Spread', Icon: BookOpen, description: 'Two pages side by side' },
]

export default function ViewModeToggle({ mode, onChange, className }: ViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      data-testid="view-mode-toggle"
      className={[
        'inline-flex items-center gap-1 rounded-full bg-slate-200 p-1 text-xs ring-1 ring-slate-300 dark:bg-white/5 dark:ring-white/10',
        className,
      ].filter(Boolean).join(' ')}
    >
      {OPTIONS.map(({ id, label, Icon, description }) => {
        const active = id === mode
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} view — ${description}`}
            data-testid={`view-mode-${id}`}
            onClick={() => onChange(id)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950',
              active
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300 dark:bg-slate-900 dark:text-white dark:ring-white/10'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
            ].join(' ')}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
