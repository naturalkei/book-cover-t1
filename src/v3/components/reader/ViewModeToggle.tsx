import clsx from 'clsx'
import { BookOpen, LayoutPanelLeft } from 'lucide-react'

import type { TViewMode } from '@v3/hooks/view-mode'
import { ViewModeOption, ViewModeOptionActive, ViewModeOptionIdle } from '@v3/lib/class-names'

interface IViewModeToggleProps {
  mode: TViewMode
  onChange: (mode: TViewMode) => void
}

export default function ViewModeToggle({ mode, onChange }: IViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={clsx(
        'inline-flex items-center gap-1 rounded-full',
        'bg-slate-200 p-1 text-xs dark:bg-white/5',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'single'}
        data-testid="view-mode-single"
        onClick={() => onChange('single')}
        className={clsx(
          ViewModeOption,
          mode === 'single' ? ViewModeOptionActive : ViewModeOptionIdle,
        )}
      >
        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Single</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'spread'}
        data-testid="view-mode-spread"
        onClick={() => onChange('spread')}
        className={clsx(
          ViewModeOption,
          mode === 'spread' ? ViewModeOptionActive : ViewModeOptionIdle,
        )}
      >
        <LayoutPanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Spread</span>
      </button>
    </div>
  )
}
