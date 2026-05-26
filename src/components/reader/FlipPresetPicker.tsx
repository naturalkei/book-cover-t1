import clsx from 'clsx'
import { Sparkles } from 'lucide-react'

import {
  FlipPresetOption,
  FlipPresetOptionActive,
  FlipPresetOptionIdle,
} from '@/lib/class-names'

import { FlipPresetList, type TFlipPresetId } from './flip-presets'

interface IFlipPresetPickerProps {
  value: TFlipPresetId
  effectiveValue?: TFlipPresetId
  onChange: (next: TFlipPresetId) => void
  locked?: boolean
  className?: string
}

export default function FlipPresetPicker({
  value,
  effectiveValue,
  onChange,
  locked = false,
  className,
}: IFlipPresetPickerProps) {
  const active = effectiveValue ?? value
  return (
    <section
      aria-label="Flip animation style"
      data-testid="flip-preset-picker"
      className={clsx(
        'mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200',
        'dark:bg-slate-900/50 dark:ring-white/5',
        className,
      )}
    >
      <header className={clsx(
        'flex items-center justify-between gap-3',
        'text-xs uppercase tracking-[0.2em]',
        'text-slate-700 dark:text-slate-300',
      )}
      >
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          flip style
        </span>
        {locked
          ? (
            <span data-testid="flip-preset-locked" className="text-slate-500 dark:text-slate-400">
              reduced motion · fade only
            </span>
          )
          : null}
      </header>

      <div
        role="radiogroup"
        aria-label="Flip animation preset"
        data-testid="flip-preset-options"
        className="mt-3 flex flex-wrap gap-2"
      >
        {FlipPresetList.map((preset) => {
          const isActive = preset.id === active
          const isStored = preset.id === value
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={isStored}
              data-testid={`flip-preset-${preset.id}`}
              data-active={isActive || undefined}
              onClick={() => onChange(preset.id)}
              className={clsx(
                FlipPresetOption,
                isActive ? FlipPresetOptionActive : FlipPresetOptionIdle,
              )}
            >
              <span className="text-sm font-semibold">{preset.label}</span>
              <span className="text-xs leading-snug text-slate-600 dark:text-slate-400">
                {preset.description}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
