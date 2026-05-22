import { useEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'

interface PageFlipProps {
  pages: string[]
  pageIndex: number
  onPageChange?: (index: number) => void
  ariaLabel?: string
  flipDurationMs?: number
}

type FlipDirection = 'forward' | 'backward' | null

export default function PageFlip({
  pages,
  pageIndex,
  onPageChange,
  ariaLabel = 'Book spread',
  flipDurationMs = 700,
}: PageFlipProps) {
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
    const neighbors = [safeIndex - 2, safeIndex - 1, safeIndex + 1, safeIndex + 2]
    for (const i of neighbors) {
      const src = pages[i]
      if (!src) continue
      const img = new window.Image()
      img.decoding = 'async'
      img.src = src
    }
  }, [safeIndex, pages])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (outgoing) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offset = event.clientX - rect.left
    const next = offset > rect.width / 2 ? safeIndex + 1 : safeIndex - 1
    if (next < 0 || next >= pages.length) return
    onPageChange?.(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (outgoing) return
    event.preventDefault()
    const next = safeIndex + 1
    if (next < pages.length) onPageChange?.(next)
  }

  const isLeftEdge = safeIndex === 0
  const isRightEdge = safeIndex === pages.length - 1

  return (
    <div
      role="group"
      aria-label={`${ariaLabel}, page ${safeIndex + 1} of ${pages.length}`}
      data-testid="page-flip"
      data-flip-state={outgoing?.direction ?? 'idle'}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="relative mx-auto aspect-[3/4] w-full max-w-2xl select-none rounded-2xl bg-slate-200 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)] ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-900 dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] dark:ring-white/5 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
      style={{ perspective: '2400px' }}
    >
      <img
        key={`page-${safeIndex}`}
        src={pages[safeIndex]}
        alt={`Page ${safeIndex + 1}`}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        data-testid="page-flip-current"
        className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        style={reducedMotion
          ? { transition: `opacity ${duration}ms ease-in-out`, opacity: outgoing ? 0.4 : 1 }
          : { backfaceVisibility: 'hidden' }}
      />

      {outgoing
        ? (
          <img
            key={`outgoing-${outgoing.index}-${outgoing.direction}`}
            src={pages[outgoing.index]}
            alt=""
            aria-hidden="true"
            decoding="async"
            data-testid="page-flip-outgoing"
            className="absolute inset-0 h-full w-full rounded-2xl object-cover will-change-transform"
            style={{
              transformOrigin: outgoing.direction === 'forward' ? 'left center' : 'right center',
              transition: reducedMotion
                ? `opacity ${duration}ms ease-in-out`
                : `transform ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity ${duration}ms ease-in-out`,
              transform: reducedMotion
                ? 'none'
                : outgoing.direction === 'forward'
                  ? 'rotateY(-180deg)'
                  : 'rotateY(180deg)',
              opacity: reducedMotion ? 0 : 0,
              boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
              backfaceVisibility: 'hidden',
            }}
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

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}
