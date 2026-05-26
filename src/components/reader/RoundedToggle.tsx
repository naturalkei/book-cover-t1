import clsx from 'clsx'

import { ToggleChipLabel } from '@/lib/class-names'

interface IRoundedToggleProps {
  rounded: boolean
  onChange: (next: boolean) => void
}

export default function RoundedToggle({ rounded, onChange }: IRoundedToggleProps) {
  return (
    <label className={clsx(ToggleChipLabel, 'cursor-pointer')} data-testid="rounded-toggle">
      <input
        type="checkbox"
        role="switch"
        aria-checked={rounded}
        checked={rounded}
        onChange={(event) => onChange(event.target.checked)}
        className={clsx(
          'h-3.5 w-3.5 cursor-pointer accent-sky-500',
          'dark:accent-sky-400',
        )}
      />
      <span>Rounded</span>
    </label>
  )
}
