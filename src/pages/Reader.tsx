import { ArrowLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import CoverModeToggle from '@/components/reader/CoverModeToggle'
import FlipPresetPicker from '@/components/reader/FlipPresetPicker'
import NotFound from '@/components/NotFound'
import PageFlip from '@/components/reader/PageFlip'
import PageJumpInput from '@/components/reader/PageJumpInput'
import ReaderControls from '@/components/reader/ReaderControls'
import ThumbnailScrubber from '@/components/reader/ThumbnailScrubber'
import ViewModeToggle from '@/components/reader/ViewModeToggle'
import { getBookById } from '@/data/books'
import { useCoverMode, type CoverMode } from '@/hooks/useCoverMode'
import { useFlipPreset } from '@/hooks/useFlipPreset'
import { useReaderKeyboard } from '@/hooks/useReaderKeyboard'
import {
  effectiveStep,
  isCoverAlone as computeIsCoverAlone,
  snapPage,
  useViewMode,
  type ViewMode,
} from '@/hooks/useViewMode'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const book = id ? getBookById(id) : undefined

  const { viewMode, setViewMode } = useViewMode()
  const { coverMode, setCoverMode } = useCoverMode()
  const { preset, effectivePreset, setPreset, reducedMotionOverride } = useFlipPreset()

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
  const step = effectiveStep(pageIndex, viewMode, coverMode)

  const commitPage = useCallback(
    (next: number) => {
      const total = book?.pages.length ?? 0
      if (total === 0) return
      const clamped = Math.min(Math.max(0, next), total - 1)
      setPageIndex(snap(clamped))
    },
    [book?.pages.length, snap],
  )

  const handleViewModeChange = useCallback((next: ViewMode) => {
    setViewMode(next)
  }, [setViewMode])

  const handleCoverModeChange = useCallback((next: CoverMode) => {
    setCoverMode(next)
  }, [setCoverMode])

  const exitToGallery = useCallback(() => navigate('/'), [navigate])

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
        message="We couldn’t find a book with that id. It may have been removed or never existed."
      />
    )
  }

  const totalPages = book.pages.length

  return (
    <section
      aria-label={`Reader for ${book.title}`}
      className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12"
    >
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:text-white dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to gallery
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          <CoverModeToggle
            coverMode={coverMode}
            onChange={handleCoverModeChange}
            disabled={viewMode !== 'spread'}
          />
          <div className="text-right">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{book.title}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">by {book.author}</p>
          </div>
        </div>
      </header>

      <PageFlip
        pages={book.pages}
        pageIndex={pageIndex}
        onPageChange={commitPage}
        ariaLabel={`${book.title} spread`}
        mode={viewMode}
        coverMode={coverMode}
        presetId={effectivePreset}
        step={step}
      />

      <ReaderControls
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPageChange={commitPage}
        step={step}
        isCoverAlone={isCoverAlone}
      />

      <div className="mt-4 flex justify-center">
        <PageJumpInput
          pageIndex={pageIndex}
          totalPages={totalPages}
          onPageChange={commitPage}
          step={step}
          snap={snap}
        />
      </div>

      <ThumbnailScrubber
        pages={book.pages}
        pageIndex={pageIndex}
        onPageChange={commitPage}
      />

      <FlipPresetPicker
        value={preset}
        effectiveValue={effectivePreset}
        onChange={setPreset}
        locked={reducedMotionOverride}
      />

      <footer className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
        tap a page side, use the controls, scrub, or jump to any page
      </footer>
    </section>
  )
}
