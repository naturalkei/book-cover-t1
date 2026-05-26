import clsx from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { BasePaginationButton } from '@/lib/class-names'

interface IReaderControlsProps {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  step?: number
  isCoverAlone?: boolean
}

export default function ReaderControls({
  pageIndex,
  totalPages,
  onPageChange,
  step = 1,
  isCoverAlone = false,
}: IReaderControlsProps) {
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
        className={BasePaginationButton}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>Prev</span>
      </button>

      <span
        aria-live="polite"
        className={clsx(
          'min-w-[7ch] text-center text-sm tabular-nums',
          'text-slate-700 dark:text-slate-300',
        )}
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
        className={BasePaginationButton}
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}
