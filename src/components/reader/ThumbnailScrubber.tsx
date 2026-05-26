import clsx from 'clsx'
import { useState, type ChangeEvent } from 'react'

import { RangeInput, ThumbnailButton } from '@/lib/class-names'

interface IThumbnailScrubberProps {
  pages: string[]
  pageIndex: number
  onPageChange: (next: number) => void
  thumbnailWindow?: number
}

const VIRTUALIZE_THRESHOLD = 50

export default function ThumbnailScrubber({
  pages,
  pageIndex,
  onPageChange,
  thumbnailWindow = 8,
}: IThumbnailScrubberProps) {
  const [dragging, setDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(pageIndex)
  const [lastPageIndex, setLastPageIndex] = useState(pageIndex)

  if (lastPageIndex !== pageIndex) {
    setLastPageIndex(pageIndex)
    setPreviewIndex(pageIndex)
  }

  const max = Math.max(0, pages.length - 1)
  const showPreview = dragging && previewIndex !== pageIndex

  const handlePointerDown = () => {
    setDragging(true)
  }

  const commit = (next: number) => {
    if (next < 0 || next > max) return
    if (next === pageIndex) return
    onPageChange(next)
  }

  const handlePointerUp = () => {
    setDragging(false)
    commit(previewIndex)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(next)) return
    setPreviewIndex(next)
    if (!dragging) commit(next)
  }

  const handleBlur = () => {
    if (!dragging) return
    setDragging(false)
    commit(previewIndex)
  }

  const thumbnails = computeThumbnails(pages.length, pageIndex, thumbnailWindow)

  return (
    <section
      aria-label="Page scrubber"
      className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900/50 dark:ring-white/5"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-700 dark:text-slate-400">
        <span>scrub</span>
        {showPreview
          ? (
            <span aria-live="polite" data-testid="scrubber-preview" className="text-sky-700 dark:text-sky-300">
              preview · page {previewIndex + 1}
            </span>
          )
          : (
            <span className="text-slate-700 dark:text-slate-400">page {pageIndex + 1} of {pages.length}</span>
          )}
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={previewIndex}
        aria-label="Scrub to page"
        aria-valuemin={1}
        aria-valuemax={pages.length}
        aria-valuenow={previewIndex + 1}
        aria-valuetext={`Page ${previewIndex + 1} of ${pages.length}`}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onBlur={handleBlur}
        className={clsx('mt-3', RangeInput)}
      />

      <ul
        aria-label="Page thumbnails"
        className="mt-3 flex w-full gap-2 overflow-x-auto pb-1"
      >
        {thumbnails.map(({ index }) => (
          <li key={index} className="shrink-0">
            <button
              type="button"
              aria-label={`Jump to page ${index + 1}`}
              aria-current={index === pageIndex ? 'page' : undefined}
              data-testid={`scrubber-thumb-${index}`}
              onClick={() => onPageChange(index)}
              className={clsx(
                ThumbnailButton,
                index === pageIndex
                  ? 'ring-sky-500 shadow-[0_0_0_2px_rgba(56,189,248,0.4)] dark:ring-sky-400'
                  : 'ring-slate-200 hover:ring-slate-300 dark:ring-white/10 dark:hover:ring-white/30',
              )}
            >
              <img
                src={pages[index]}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface IThumbnail {
  index: number
}

const computeThumbnails = (
  total: number,
  pageIndex: number,
  windowSize: number,
): IThumbnail[] => {
  const all: IThumbnail[] = Array.from({ length: total }, (_, index) => ({ index }))
  if (total <= VIRTUALIZE_THRESHOLD) return all
  return all.filter(({ index }) => Math.abs(index - pageIndex) <= windowSize)
}
