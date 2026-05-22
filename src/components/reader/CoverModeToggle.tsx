import type { CoverMode } from '@/hooks/useCoverMode'

interface CoverModeToggleProps {
  coverMode: CoverMode
  onChange: (next: CoverMode) => void
  disabled?: boolean
}

export default function CoverModeToggle({ coverMode, onChange, disabled = false }: CoverModeToggleProps) {
  const checked = coverMode === 'single'
  return (
    <label
      className={[
        'inline-flex select-none items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-slate-700 ring-1 ring-slate-300 dark:bg-white/5 dark:text-slate-200 dark:ring-white/5',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
      data-testid="cover-mode-toggle"
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked ? 'single' : 'spread')}
        className="h-3.5 w-3.5 cursor-pointer accent-sky-500 disabled:cursor-not-allowed dark:accent-sky-400"
      />
      <span>Cover alone</span>
    </label>
  )
}
