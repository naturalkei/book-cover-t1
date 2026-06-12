import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import CoverModeToggle from '@v3/components/reader/CoverModeToggle'
import PageFlipEngine from '@v3/components/reader/PageFlipEngine'
import ReaderControls from '@v3/components/reader/ReaderControls'
import ViewModeToggle from '@v3/components/reader/ViewModeToggle'
import NotFound from '@v3/components/NotFound'
import { getBookById } from '@v3/data/books'
import { useCoverMode, type TCoverMode } from '@v3/hooks/cover-mode'
import { useReaderKeyboard } from '@v3/hooks/reader-keyboard'
import {
  getEffectiveStep,
  isCoverAlone as computeIsCoverAlone,
  snapPage,
  useViewMode,
  type TViewMode,
} from '@v3/hooks/view-mode'
import { TextLink } from '@v3/lib/class-names'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const book = id ? getBookById(id) : undefined

  const { viewMode, setViewMode } = useViewMode()
  const { coverMode, setCoverMode } = useCoverMode()

  const snap = useCallback(
    (index: number) => snapPage(index, viewMode, coverMode),
    [viewMode, coverMode],
  )

  const [pageIndex, setPageIndex] = useState(0)
  const [lastSnapKey, setLastSnapKey] = useState(`${viewMode}:${coverMode}`)
  const currentSnapKey = `${viewMode}:${coverMode}`
  if (lastSnapKey !== currentSnapKey) {
    setLastSnapKey(currentSnapKey)
    setPageIndex((current) => snap(current))
  }

  const isCoverAlone = computeIsCoverAlone(pageIndex, viewMode, coverMode)
  const step = getEffectiveStep(pageIndex, viewMode, coverMode)

  const commitPage = useCallback(
    (next: number) => {
      const total = book?.pages.length ?? 0
      if (total === 0) return
      const clamped = Math.min(Math.max(0, next), total - 1)
      setPageIndex(snap(clamped))
    },
    [book?.pages.length, snap],
  )

  const exitToGallery = useCallback(() => navigate('/v3'), [navigate])

  useReaderKeyboard({
    pageIndex,
    totalPages: book?.pages.length ?? 0,
    onPageChange: commitPage,
    onExit: exitToGallery,
    step,
    snap,
  })

  if (!book) {
    return (
      <NotFound
        title="Book not found"
        message="We couldn't find a book with that id."
      />
    )
  }

  return (
    <section
      aria-label={`Reader for ${book.title}`}
      className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12"
    >
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link to="/v3" className={TextLink}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to gallery
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <ViewModeToggle mode={viewMode} onChange={(next: TViewMode) => setViewMode(next)} />
          <CoverModeToggle
            coverMode={coverMode}
            onChange={(next: TCoverMode) => setCoverMode(next)}
            disabled={viewMode !== 'spread'}
          />
          <div className="text-right">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{book.title}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">by {book.author}</p>
          </div>
        </div>
      </header>

      <PageFlipEngine
        pages={book.pages}
        pageIndex={pageIndex}
        onPageChange={commitPage}
        ariaLabel={`${book.title} spread`}
        mode={viewMode}
        coverMode={coverMode}
        step={step}
      />

      <ReaderControls
        pageIndex={pageIndex}
        totalPages={book.pages.length}
        onPageChange={commitPage}
        step={step}
        isCoverAlone={isCoverAlone}
      />

      <footer className={clsx(
        'mt-6 text-center text-xs uppercase tracking-[0.2em]',
        'text-slate-600 dark:text-slate-400',
      )}
      >
        progress-driven css curl · tap or use controls
      </footer>
    </section>
  )
}
