import { useEffect, useRef, useState } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ViewMode } from '@/hooks/useViewMode'

import {
  DEFAULT_FLIP_PRESET,
  getFlipPreset,
  type FlipDirection,
  type FlipFrames,
  type FlipPresetId,
} from './flipPresets'

interface PageFlipProps {
  pages: string[]
  pageIndex: number
  onPageChange?: (index: number) => void
  ariaLabel?: string
  flipDurationMs?: number
  mode?: ViewMode
  presetId?: FlipPresetId
}

export default function PageFlip({
  pages,
  pageIndex,
  onPageChange,
  ariaLabel = 'Book spread',
  flipDurationMs = 700,
  mode = 'single',
  presetId = DEFAULT_FLIP_PRESET,
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
      data-flip-preset={presetId}
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
        outgoingExists={!!outgoing}
        staticStyle={staticStyle(reducedMotion, !!outgoing, duration)}
        testIdPrefix="page-flip-current"
        loading="eager"
        fetchPriority="high"
      />

      {outgoing
        ? (
          <OutgoingLayer
            key={`outgoing-${outgoing.index}-${outgoing.direction}`}
            pages={pages}
            index={outgoing.index}
            mode={mode}
            direction={outgoing.direction as FlipDirection}
            duration={duration}
            presetId={presetId}
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

const staticStyle = (
  reducedMotion: boolean,
  outgoingExists: boolean,
  duration: number,
): React.CSSProperties => {
  if (reducedMotion) {
    return { transition: `opacity ${duration}ms ease-in-out`, opacity: outgoingExists ? 0.4 : 1 }
  }
  return { backfaceVisibility: 'hidden' }
}

interface PageSurfaceProps {
  pages: string[]
  index: number
  mode: ViewMode
  outgoingExists: boolean
  staticStyle: React.CSSProperties
  testIdPrefix: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
}

function PageSurface({
  pages,
  index,
  mode,
  staticStyle,
  testIdPrefix,
  loading = 'lazy',
  fetchPriority,
}: PageSurfaceProps) {
  if (mode === 'single') {
    const src = pages[index]
    return (
      <img
        key={`page-${index}`}
        src={src}
        alt={`Page ${index + 1}`}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        data-testid={testIdPrefix}
        className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        style={staticStyle}
      />
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      data-testid={`${testIdPrefix}-spread`}
      className="absolute inset-0 flex overflow-hidden rounded-2xl"
      style={staticStyle}
    >
      <img
        src={leftSrc}
        alt={`Page ${index + 1}`}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        data-testid={testIdPrefix}
        className="h-full w-1/2 object-cover"
      />
      {rightSrc
        ? (
          <img
            src={rightSrc}
            alt={`Page ${index + 2}`}
            loading={loading}
            decoding="async"
            data-testid={`${testIdPrefix}-right`}
            className="h-full w-1/2 object-cover"
          />
        )
        : (
          <div
            aria-hidden="true"
            data-testid={`${testIdPrefix}-right-empty`}
            className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40"
          />
        )}
    </div>
  )
}

interface OutgoingLayerProps {
  pages: string[]
  index: number
  mode: ViewMode
  direction: FlipDirection
  duration: number
  presetId: FlipPresetId
}

function OutgoingLayer({
  pages,
  index,
  mode,
  direction,
  duration,
  presetId,
}: OutgoingLayerProps) {
  const frames: FlipFrames = getFlipPreset(presetId).build(direction, duration)
  const [phase, setPhase] = useState<'initial' | 'final'>('initial')

  useEffect(() => {
    let cancelled = false
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        if (!cancelled) setPhase('final')
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])

  const style = phase === 'initial' ? frames.initial : frames.final

  if (mode === 'single') {
    const src = pages[index]
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        decoding="async"
        data-testid="page-flip-outgoing"
        data-flip-phase={phase}
        className="absolute inset-0 h-full w-full rounded-2xl object-cover will-change-transform"
        style={style}
      />
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      aria-hidden="true"
      data-testid="page-flip-outgoing"
      data-flip-phase={phase}
      className="absolute inset-0 flex overflow-hidden rounded-2xl will-change-transform"
      style={style}
    >
      <img
        src={leftSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="h-full w-1/2 object-cover"
      />
      {rightSrc
        ? (
          <img
            src={rightSrc}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="h-full w-1/2 object-cover"
          />
        )
        : (
          <div aria-hidden="true" className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40" />
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
