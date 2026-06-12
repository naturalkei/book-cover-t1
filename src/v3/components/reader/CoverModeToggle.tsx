import clsx from 'clsx'

import type { TCoverMode } from '@v3/hooks/cover-mode'
import { FocusRing } from '@v3/lib/class-names'

interface ICoverModeToggleProps {
  coverMode: TCoverMode
  onChange: (mode: TCoverMode) => void
  disabled?: boolean
}

export default function CoverModeToggle({
  coverMode,
  onChange,
  disabled = false,
}: ICoverModeToggleProps) {
  const checked = coverMode === 'single'
  return (
    <label
      className={clsx(
        'inline-flex cursor-pointer items-center gap-2',
        'rounded-full bg-slate-200 px-3 py-1.5',
        'text-xs font-medium uppercase tracking-[0.15em]',
        'text-slate-700 ring-1 ring-slate-300',
        'dark:bg-white/5 dark:text-slate-200 dark:ring-white/5',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <input
        type="checkbox"
        role="switch"
        aria-label="Cover alone"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(checked ? 'spread' : 'single')}
        className={clsx('accent-emerald-600', FocusRing)}
      />
      <span>Cover alone</span>
    </label>
  )
}
