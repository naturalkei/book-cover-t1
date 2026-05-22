interface RoundedToggleProps {
  rounded: boolean
  onChange: (next: boolean) => void
}

export default function RoundedToggle({ rounded, onChange }: RoundedToggleProps) {
  return (
    <label
      className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-slate-700 ring-1 ring-slate-300 dark:bg-white/5 dark:text-slate-200 dark:ring-white/5"
      data-testid="rounded-toggle"
    >
      <input
        type="checkbox"
        role="switch"
        aria-checked={rounded}
        checked={rounded}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 cursor-pointer accent-sky-500 dark:accent-sky-400"
      />
      <span>Rounded</span>
    </label>
  )
}
