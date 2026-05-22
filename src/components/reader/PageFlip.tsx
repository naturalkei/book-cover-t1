import { useEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ViewMode } from '@/hooks/useViewMode'

interface PageFlipProps {
  pages: string[]
  pageIndex: number
  onPageChange?: (index: number) => void
  ariaLabel?: string
  flipDurationMs?: number
  mode?: ViewMode
}

type FlipDirection = 'forward' | 'backward' | null

export default function PageFlip({
  pages,
  pageIndex,
  onPageChange,
  ariaLabel = 'Book spread',
  flipDurationMs = 700,
  mode = 'single',
}: PageFlipProps) {
  const step = mode === 'spread' ? 2 : 1
  const safeIndex = clamp(pageIndex, 0, pages.length - 1)
  const [outgoing, setOutgoing] = useState<{ index: number; direction: FlipDirection } | null>(null)
  const lastIndexRef = useRef(safeIndex)
  const reducedMotion = useReducedMotion()
  const duration = reducedMotion ? Math.min(220, flipDurationMs) : flipDurationMs

  useEffect(() => {
    const prev = lastIndexRef.current
    if (safeIndex === prev) return
    const direction: FlipDirection = safeIndex > prev ? 'forward' : 'backward'
    setOutgoing({ index: prev, direction })
    lastIndexRef.current = safeIndex
    const t = window.setTimeout(() => setOutgoing(null), duration)
    return () => window.clearTimeout(t)
  }, [safeIndex, duration])

  useEffect(() => {
    const offsets = mode === 'spread' ? [-4, -3, -2, -1, 2, 3, 4, 5] : [-2, -1, 1, 2]
    for (const offset of offsets) {
      const src = pages[safeIndex + offset]
      if (!src) continue
      const img = new window.Image()
      img.decoding = 'async'
      img.src = src
    }
  }, [safeIndex, pages, mode])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (outgoing) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offset = event.clientX - rect.left
    const next = offset > rect.width / 2 ? safeIndex + step : safeIndex - step
    if (next < 0 || next >= pages.length) return
    onPageChange?.(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (outgoing) return
    event.preventDefault()
    const next = safeIndex + step
    if (next < pages.length) onPageChange?.(next)
  }

  const isLeftEdge = safeIndex === 0
  const isRightEdge = safeIndex + step >= pages.length

  return (
    <div
      role="group"
      aria-label={`${ariaLabel}, page ${safeIndex + 1} of ${pages.length}`}
      data-testid="page-flip"
      data-flip-state={outgoing?.direction ?? 'idle'}
      data-view-mode={mode}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={[
        'relative mx-auto w-full select-none rounded-2xl bg-slate-200 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)] ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-900 dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] dark:ring-white/5 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950',
        mode === 'spread' ? 'aspect-[3/2] max-w-4xl' : 'aspect-[3/4] max-w-2xl',
      ].join(' ')}
      style={{ perspective: '2400px' }}
    >
      <PageSurface
        pages={pages}
        index={safeIndex}
        mode={mode}
        reducedMotion={reducedMotion}
        duration={duration}
        outgoing={!!outgoing}
        testIdPrefix="page-flip-current"
        loading="eager"
        fetchPriority="high"
      />

      {outgoing
        ? (
          <PageSurface
            key={`outgoing-${outgoing.index}-${outgoing.direction}`}
            pages={pages}
            index={outgoing.index}
            mode={mode}
            reducedMotion={reducedMotion}
            duration={duration}
            outgoing
            outgoingDirection={outgoing.direction}
            testIdPrefix="page-flip-outgoing"
          />
        )
        : null}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-black/0 via-black/30 to-black/0"
      />

      {isLeftEdge
        ? null
        : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-black/30 to-transparent"
          />
        )}
      {isRightEdge
        ? null
        : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-black/30 to-transparent"
          />
        )}
    </div>
  )
}

interface PageSurfaceProps {
  pages: string[]
  index: number
  mode: ViewMode
  reducedMotion: boolean
  duration: number
  outgoing: boolean
  outgoingDirection?: FlipDirection
  testIdPrefix: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

function PageSurface({
  pages,
  index,
  mode,
  reducedMotion,
  duration,
  outgoing,
  outgoingDirection,
  testIdPrefix,
  loading = 'lazy',
  fetchPriority,
}: PageSurfaceProps) {
  const isLayer = outgoing && outgoingDirection !== undefined
  const baseStyle: React.CSSProperties = isLayer
    ? {
      transformOrigin: outgoingDirection === 'forward' ? 'left center' : 'right center',
      transition: reducedMotion
        ? `opacity ${duration}ms ease-in-out`
        : `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity ${duration}ms ease-in-out`,
      transform: reducedMotion
        ? 'none'
        : outgoingDirection === 'forward'
          ? 'rotateY(-180deg)'
          : 'rotateY(180deg)',
      opacity: 0,
      boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
      backfaceVisibility: 'hidden',
    }
    : reducedMotion
      ? { transition: `opacity ${duration}ms ease-in-out`, opacity: outgoing ? 0.4 : 1 }
      : { backfaceVisibility: 'hidden' }

  if (mode === 'single') {
    const src = pages[index]
    return (
      <img
        key={`page-${index}`}
        src={src}
        alt={isLayer ? '' : `Page ${index + 1}`}
        aria-hidden={isLayer ? true : undefined}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        data-testid={testIdPrefix}
        className={[
          'absolute inset-0 h-full w-full rounded-2xl object-cover',
          isLayer ? 'will-change-transform' : '',
        ].filter(Boolean).join(' ')}
        style={baseStyle}
      />
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      data-testid={isLayer ? undefined : `${testIdPrefix}-spread`}
      aria-hidden={isLayer ? true : undefined}
      className={[
        'absolute inset-0 flex overflow-hidden rounded-2xl',
        isLayer ? 'will-change-transform' : '',
      ].filter(Boolean).join(' ')}
      style={baseStyle}
    >
      <img
        src={leftSrc}
        alt={isLayer ? '' : `Page ${index + 1}`}
        aria-hidden={isLayer ? true : undefined}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        data-testid={isLayer ? undefined : testIdPrefix}
        className="h-full w-1/2 object-cover"
      />
      {rightSrc
        ? (
          <img
            src={rightSrc}
            alt={isLayer ? '' : `Page ${index + 2}`}
            aria-hidden={isLayer ? true : undefined}
            loading={loading}
            decoding="async"
            data-testid={isLayer ? undefined : `${testIdPrefix}-right`}
            className="h-full w-1/2 object-cover"
          />
        )
        : (
          <div
            aria-hidden="true"
            data-testid={isLayer ? undefined : `${testIdPrefix}-right-empty`}
            className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40"
          />
        )}
    </div>
  )
}

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}
