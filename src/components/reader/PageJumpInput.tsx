import { useId, useState, type ChangeEvent, type FormEvent } from 'react'

interface PageJumpInputProps {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  className?: string
}

export default function PageJumpInput({
  pageIndex,
  totalPages,
  onPageChange,
  className,
}: PageJumpInputProps) {
  const inputId = useId()
  const [draft, setDraft] = useState<string>(String(pageIndex + 1))
  const [lastPageIndex, setLastPageIndex] = useState<number>(pageIndex)
  if (lastPageIndex !== pageIndex) {
    setLastPageIndex(pageIndex)
    setDraft(String(pageIndex + 1))
  }

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(pageIndex + 1))
      return
    }
    const clamped = Math.min(Math.max(1, parsed), totalPages)
    setDraft(String(clamped))
    if (clamped - 1 !== pageIndex) onPageChange(clamped - 1)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    commit(draft)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value)
  }

  return (
    <form
      role="search"
      aria-label="Jump to page"
      noValidate
      onSubmit={handleSubmit}
      className={[
        'inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-300 dark:bg-white/5 dark:text-slate-200 dark:ring-white/5',
        className,
      ].filter(Boolean).join(' ')}
    >
      <label htmlFor={inputId} className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
        go to
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={1}
        max={totalPages}
        value={draft}
        onChange={handleChange}
        onBlur={() => commit(draft)}
        aria-label={`Page number, between 1 and ${totalPages}`}
        className="w-14 appearance-none bg-transparent text-center tabular-nums text-slate-900 focus-visible:outline-none dark:text-slate-100"
      />
      <span aria-hidden="true" className="text-slate-500 dark:text-slate-500">/ {totalPages}</span>
      <button type="submit" className="sr-only">go</button>
    </form>
  )
}
