import clsx from 'clsx'
import { BookOpen, FileText } from 'lucide-react'

import type { TViewMode } from '@/hooks/view-mode'
import { ViewModeOption } from '@/lib/class-names'

interface IViewModeToggleProps {
  mode: TViewMode
  onChange: (next: TViewMode) => void
  className?: string
}

interface IOption {
  id: TViewMode
  label: string
  Icon: typeof BookOpen
  description: string
}

const ViewModeOptions: IOption[] = [
  { id: 'single', label: 'Single', Icon: FileText, description: 'One page at a time' },
  { id: 'spread', label: 'Spread', Icon: BookOpen, description: 'Two pages side by side' },
]

export default function ViewModeToggle({ mode, onChange, className }: IViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      data-testid="view-mode-toggle"
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-slate-200 p-1 text-xs',
        'ring-1 ring-slate-300 dark:bg-white/5 dark:ring-white/10',
        className,
      )}
    >
      {ViewModeOptions.map(({ id, label, Icon, description }) => {
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
            className={clsx(
              ViewModeOption,
              active
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-300 dark:bg-slate-900 dark:text-white dark:ring-white/10'
                : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
