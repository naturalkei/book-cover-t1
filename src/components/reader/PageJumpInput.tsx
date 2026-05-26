import clsx from 'clsx'
import { useId, useState, type ChangeEvent, type FormEvent } from 'react'

import { PageJumpForm } from '@/lib/class-names'

interface IPageJumpInputProps {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  className?: string
  step?: number
  snap?: (index: number) => number
}

export default function PageJumpInput({
  pageIndex,
  totalPages,
  onPageChange,
  className,
  step = 1,
  snap,
}: IPageJumpInputProps) {
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
    const safeStep = Math.max(1, Math.floor(step))
    const rawTarget = clamped - 1
    const targetIndex = snap
      ? snap(rawTarget)
      : rawTarget - (rawTarget % safeStep)
    setDraft(String(targetIndex + 1))
    if (targetIndex !== pageIndex) onPageChange(targetIndex)
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
      className={clsx(PageJumpForm, className)}
    >
      <label
        htmlFor={inputId}
        className={clsx(
          'text-xs uppercase tracking-[0.2em]',
          'text-slate-700 dark:text-slate-400',
        )}
      >
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
        className={clsx(
          'w-14 appearance-none bg-transparent text-center',
          'tabular-nums text-slate-900 focus-visible:outline-none',
          'dark:text-slate-100',
        )}
      />
      <span aria-hidden="true" className="text-slate-700 dark:text-slate-400">/ {totalPages}</span>
      <button type="submit" className="sr-only">go</button>
    </form>
  )
}
