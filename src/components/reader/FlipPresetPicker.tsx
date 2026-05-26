import { Sparkles } from 'lucide-react'

import { FLIP_PRESET_LIST, type FlipPresetId } from './flip-presets'

interface FlipPresetPickerProps {
  value: FlipPresetId
  effectiveValue?: FlipPresetId
  onChange: (next: FlipPresetId) => void
  locked?: boolean
  className?: string
}

export default function FlipPresetPicker({
  value,
  effectiveValue,
  onChange,
  locked = false,
  className,
}: FlipPresetPickerProps) {
  const active = effectiveValue ?? value
  return (
    <section
      aria-label="Flip animation style"
      data-testid="flip-preset-picker"
      className={[
        'mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-white/5',
        className,
      ].filter(Boolean).join(' ')}
    >
      <header className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">
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
        {FLIP_PRESET_LIST.map((preset) => {
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
              className={[
                'group flex min-w-[8rem] flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950',
                isActive
                  ? 'border-sky-500 bg-sky-50 text-slate-900 shadow-sm dark:border-sky-400 dark:bg-sky-400/10 dark:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-white/20',
              ].join(' ')}
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
