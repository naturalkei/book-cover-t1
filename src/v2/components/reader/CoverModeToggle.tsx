import clsx from 'clsx'

import type { TCoverMode } from '@v2/hooks/cover-mode'
import { ToggleChipLabel } from '@v2/lib/class-names'

interface ICoverModeToggleProps {
  coverMode: TCoverMode
  onChange: (next: TCoverMode) => void
  disabled?: boolean
}

export default function CoverModeToggle({ coverMode, onChange, disabled = false }: ICoverModeToggleProps) {
  const checked = coverMode === 'single'
  return (
    <label
      className={clsx(
        ToggleChipLabel,
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
      data-testid="cover-mode-toggle"
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked ? 'single' : 'spread')}
        className={clsx(
          'h-3.5 w-3.5 cursor-pointer accent-sky-500',
          'disabled:cursor-not-allowed dark:accent-sky-400',
        )}
      />
      <span>Cover alone</span>
    </label>
  )
}
