import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ReaderControlsProps {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  step?: number
  isCoverAlone?: boolean
}

const baseButton = 'inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950 dark:disabled:hover:bg-white/5'

export default function ReaderControls({
  pageIndex,
  totalPages,
  onPageChange,
  step = 1,
  isCoverAlone = false,
}: ReaderControlsProps) {
  const canPrev = pageIndex > 0
  const canNext = pageIndex + step < totalPages || (isCoverAlone && totalPages > 1)
  const showsRange = !isCoverAlone && step > 1 && pageIndex + 1 < totalPages

  return (
    <nav
      aria-label="Reader pagination"
      className="mt-6 flex items-center justify-center gap-3"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={!canPrev}
        onClick={() => onPageChange(pageIndex - step)}
        className={baseButton}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Prev</span>
      </button>

      <span
        aria-live="polite"
        className="min-w-[7ch] text-center text-sm tabular-nums text-slate-700 dark:text-slate-300"
      >
        <span data-testid="reader-current-page">{pageIndex + 1}</span>
        {showsRange
          ? (
            <>
              <span aria-hidden="true" className="px-0.5">–</span>
              <span data-testid="reader-current-page-right">{Math.min(pageIndex + 2, totalPages)}</span>
            </>
          )
          : null}
        <span aria-hidden="true" className="px-1 text-slate-500 dark:text-slate-500">/</span>
        <span data-testid="reader-total-pages">{totalPages}</span>
      </span>

      <button
        type="button"
        aria-label="Next page"
        disabled={!canNext}
        onClick={() => onPageChange(pageIndex + step)}
        className={baseButton}
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
