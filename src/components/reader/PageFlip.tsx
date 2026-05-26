import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import type { TCoverMode } from '@/hooks/cover-mode'
import { useReducedMotion } from '@/hooks/reduced-motion'
import type { TViewMode } from '@/hooks/view-mode'
import { FocusRingOnSlate50 } from '@/lib/class-names'

import {
  DEFAULT_FLIP_PRESET,
  getFlipPreset,
  type TFlipDirection,
  type IFlipFrames,
  type TFlipPresetId,
} from './flip-presets'

interface IPageFlipProps {
  pages: string[]
  pageIndex: number
  onPageChange?: (index: number) => void
  ariaLabel?: string
  flipDurationMs?: number
  mode?: TViewMode
  coverMode?: TCoverMode
  presetId?: TFlipPresetId
  step?: 1 | 2
  rounded?: boolean
}

export default function PageFlip({
  pages,
  pageIndex,
  onPageChange,
  ariaLabel = 'Book spread',
  flipDurationMs = 700,
  mode = 'single',
  coverMode = 'spread',
  presetId = DEFAULT_FLIP_PRESET,
  step: stepProp,
  rounded = false,
}: IPageFlipProps) {
  const isCoverPage = (index: number): boolean =>
    mode === 'spread' && coverMode === 'single' && index === 0
  const safeIndex = clamp(pageIndex, 0, pages.length - 1)
  const defaultStep: 1 | 2 = mode === 'spread' ? (isCoverPage(safeIndex) ? 1 : 2) : 1
  const step: 1 | 2 = stepProp ?? defaultStep
  const coverAlone = isCoverPage(safeIndex)
  const roundClass = rounded ? 'rounded-2xl' : ''
  const innerRoundClass = rounded ? 'rounded-2xl' : ''
  const [outgoing, setOutgoing] = useState<{ index: number; direction: TFlipDirection } | null>(null)
  const lastIndexRef = useRef(safeIndex)
  const reducedMotion = useReducedMotion()
  const duration = reducedMotion ? Math.min(220, flipDurationMs) : flipDurationMs

  useEffect(() => {
    const prev = lastIndexRef.current
    if (safeIndex === prev) return
    const direction: TFlipDirection = safeIndex > prev ? 'forward' : 'backward'
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
    const rawNext = offset > rect.width / 2 ? safeIndex + step : safeIndex - step
    // Underflow: if a step backward would land before 0, fall back to the
    // cover (0) so the user can tap the left half of the first spread to
    // close the book in coverMode='single'. Only bail when we're already
    // at the start — there's nowhere further to go.
    let next = rawNext
    if (next < 0) {
      if (safeIndex === 0) return
      next = 0
    }
    if (next >= pages.length) return
    onPageChange?.(next)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (outgoing) return
    event.preventDefault()
    const next = safeIndex + step
    if (next < pages.length) onPageChange?.(next)
  }

  return (
    <div
      role="group"
      aria-label={`${ariaLabel}, page ${safeIndex + 1} of ${pages.length}`}
      data-testid="page-flip"
      data-flip-state={outgoing?.direction ?? 'idle'}
      data-view-mode={mode}
      data-cover-alone={coverAlone ? 'true' : 'false'}
      data-flip-preset={presetId}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-rounded={rounded ? 'true' : 'false'}
      className={clsx(
        'relative mx-auto w-full select-none bg-slate-200',
        'shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)] ring-1 ring-slate-200',
        'dark:bg-slate-900 dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] dark:ring-white/5',
        FocusRingOnSlate50,
        roundClass,
        mode === 'spread' ? 'aspect-[3/2] max-w-4xl' : 'aspect-[3/4] max-w-2xl',
      )}
      style={{ perspective: '2400px' }}
    >
      <PageSurface
        pages={pages}
        index={safeIndex}
        mode={mode}
        coverAlone={coverAlone}
        outgoingExists={!!outgoing}
        staticStyle={staticStyle(reducedMotion, !!outgoing, duration)}
        testIdPrefix="page-flip-current"
        loading="eager"
        fetchPriority="high"
        roundClass={innerRoundClass}
      />

      {outgoing
        ? (
          shouldUseCoverLeaf(mode, coverMode, outgoing.index, safeIndex)
            ? (
              <OutgoingCoverLeaf
                key={`cover-${outgoing.index}-${safeIndex}-${outgoing.direction}`}
                pages={pages}
                direction={outgoing.direction as TFlipDirection}
                duration={duration}
                presetId={presetId}
                roundClass={innerRoundClass}
              />
            )
            : shouldUseSpreadLeaf(mode, outgoing.index, safeIndex, isCoverPage)
              ? (
                <OutgoingSpreadLeaf
                  key={`spread-${outgoing.index}-${safeIndex}-${outgoing.direction}`}
                  pages={pages}
                  fromIndex={outgoing.index}
                  toIndex={safeIndex}
                  direction={outgoing.direction as TFlipDirection}
                  duration={duration}
                  presetId={presetId}
                  roundClass={innerRoundClass}
                />
              )
              : (
                <OutgoingLayer
                  key={`outgoing-${outgoing.index}-${outgoing.direction}`}
                  pages={pages}
                  index={outgoing.index}
                  mode={mode}
                  coverAlone={isCoverPage(outgoing.index)}
                  direction={outgoing.direction as TFlipDirection}
                  duration={duration}
                  presetId={presetId}
                  roundClass={innerRoundClass}
                />
              )
        )
        : null}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-black/0 via-black/30 to-black/0"
      />
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

interface IPageSurfaceProps {
  pages: string[]
  index: number
  mode: TViewMode
  coverAlone: boolean
  outgoingExists: boolean
  staticStyle: React.CSSProperties
  testIdPrefix: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  roundClass: string
}

function PageSurface({
  pages,
  index,
  mode,
  coverAlone,
  staticStyle,
  testIdPrefix,
  loading = 'lazy',
  fetchPriority,
  roundClass,
}: IPageSurfaceProps) {
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
        className={['absolute inset-0 h-full w-full object-cover', roundClass].filter(Boolean).join(' ')}
        style={staticStyle}
      />
    )
  }

  if (coverAlone) {
    const coverSrc = pages[index]
    return (
      <div
        data-testid={`${testIdPrefix}-spread`}
        className={['absolute inset-0 flex overflow-hidden', roundClass].filter(Boolean).join(' ')}
        style={staticStyle}
      >
        <div
          aria-hidden="true"
          data-testid={`${testIdPrefix}-cover-blank`}
          className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40"
        />
        <img
          src={coverSrc}
          alt={`Page ${index + 1}`}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          data-testid={testIdPrefix}
          className="h-full w-1/2 object-cover"
        />
      </div>
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      data-testid={`${testIdPrefix}-spread`}
      className={['absolute inset-0 flex overflow-hidden', roundClass].filter(Boolean).join(' ')}
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

interface IOutgoingLayerProps {
  pages: string[]
  index: number
  mode: TViewMode
  coverAlone: boolean
  direction: TFlipDirection
  duration: number
  presetId: TFlipPresetId
  roundClass: string
}

function OutgoingLayer({
  pages,
  index,
  mode,
  coverAlone,
  direction,
  duration,
  presetId,
  roundClass,
}: IOutgoingLayerProps) {
  const frames: IFlipFrames = getFlipPreset(presetId).build(direction, duration)
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
        className={[
          'absolute inset-0 h-full w-full object-cover will-change-transform',
          roundClass,
        ].filter(Boolean).join(' ')}
        style={style}
      />
    )
  }

  if (coverAlone) {
    const coverSrc = pages[index]
    return (
      <div
        aria-hidden="true"
        data-testid="page-flip-outgoing"
        data-flip-phase={phase}
        className={[
          'absolute inset-0 flex overflow-hidden will-change-transform',
          roundClass,
        ].filter(Boolean).join(' ')}
        style={style}
      >
        <div aria-hidden="true" className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40" />
        <img
          src={coverSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="h-full w-1/2 object-cover"
        />
      </div>
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      aria-hidden="true"
      data-testid="page-flip-outgoing"
      data-flip-phase={phase}
      className={[
        'absolute inset-0 flex overflow-hidden will-change-transform',
        roundClass,
      ].filter(Boolean).join(' ')}
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

const shouldUseSpreadLeaf = (
  mode: TViewMode,
  outgoingIndex: number,
  currentIndex: number,
  isCoverPage: (index: number) => boolean,
): boolean => {
  if (mode !== 'spread') return false
  if (isCoverPage(outgoingIndex)) return false
  if (isCoverPage(currentIndex)) return false
  return true
}

interface IOutgoingSpreadLeafProps {
  pages: string[]
  fromIndex: number
  toIndex: number
  direction: TFlipDirection
  duration: number
  presetId: TFlipPresetId
  roundClass: string
}

function OutgoingSpreadLeaf({
  pages,
  fromIndex,
  toIndex,
  direction,
  duration,
  presetId,
  roundClass,
}: IOutgoingSpreadLeafProps) {
  const frames: IFlipFrames = getFlipPreset(presetId).build(direction, duration, 'spread')
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

  const leafStyle: React.CSSProperties = phase === 'initial' ? frames.initial : frames.final
  const isForward = direction === 'forward'

  const frontSrc = isForward ? pages[fromIndex + 1] : pages[fromIndex]
  const backSrc = isForward ? pages[toIndex] : pages[toIndex + 1]
  const phantomSrc = isForward ? pages[fromIndex] : pages[fromIndex + 1]

  const leafSidePosition = isForward ? 'right-0' : 'left-0'
  const phantomSidePosition = isForward ? 'left-0' : 'right-0'

  return (
    <>
      {phantomSrc
        ? (
          <div
            aria-hidden="true"
            data-testid="page-flip-phantom"
            className={[
              'absolute inset-y-0 w-1/2 overflow-hidden',
              phantomSidePosition,
              roundClass,
            ].filter(Boolean).join(' ')}
          >
            <img
              src={phantomSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        )
        : null}

      <div
        aria-hidden="true"
        data-testid="page-flip-outgoing"
        data-flip-phase={phase}
        className={[
          'absolute inset-y-0 w-1/2 will-change-transform',
          leafSidePosition,
        ].filter(Boolean).join(' ')}
        style={{ ...leafStyle, transformStyle: 'preserve-3d' }}
      >
        {frontSrc
          ? (
            <img
              src={frontSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              data-testid="page-flip-outgoing-front"
              className={[
                'absolute inset-0 h-full w-full object-cover',
                roundClass,
              ].filter(Boolean).join(' ')}
              style={{ backfaceVisibility: 'hidden' }}
            />
          )
          : null}
        {backSrc
          ? (
            <img
              src={backSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              data-testid="page-flip-outgoing-back"
              className={[
                'absolute inset-0 h-full w-full object-cover',
                roundClass,
              ].filter(Boolean).join(' ')}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            />
          )
          : null}
      </div>
    </>
  )
}

/**
 * Cover-boundary transitions in spread + coverMode='single':
 *   forward  0 → 1: leaf carries the cover (peels off the right half)
 *   backward 1 → 0: leaf carries the cover (settles back onto the right half)
 *
 * Any other transition (deeper into the book, single mode, coverMode='spread')
 * is handled by the existing leaf paths.
 */
const shouldUseCoverLeaf = (
  mode: TViewMode,
  coverMode: TCoverMode,
  outgoingIndex: number,
  currentIndex: number,
): boolean => {
  if (mode !== 'spread') return false
  if (coverMode !== 'single') return false
  const isForward = outgoingIndex === 0 && currentIndex === 1
  const isBackward = outgoingIndex === 1 && currentIndex === 0
  return isForward || isBackward
}

interface IOutgoingCoverLeafProps {
  pages: string[]
  direction: TFlipDirection
  duration: number
  presetId: TFlipPresetId
  roundClass: string
}

/**
 * Half-width leaf used only at the cover boundary in spread + coverMode='single'.
 * Forward: leaf rotates 0° → -180°, peeling the cover off the right half.
 * Backward: same leaf, but the rotation is reversed (-180° → 0°) so the cover
 * "closes" back onto the right half. A phantom on the opposite half masks the
 * static layer underneath until the leaf's matching face arrives.
 */
function OutgoingCoverLeaf({
  pages,
  direction,
  duration,
  presetId,
  roundClass,
}: IOutgoingCoverLeafProps) {
  // We always build the forward (right-pivot, 0° → -180°) spread frames and
  // swap initial/final for backward, so the leaf's DOM position and pivot stay
  // identical between directions — the cover never DOM-jumps between sides.
  const baseFrames: IFlipFrames = getFlipPreset(presetId)
    .build('forward', duration, 'spread')
  const frames: IFlipFrames = direction === 'forward'
    ? baseFrames
    : { initial: baseFrames.final, final: baseFrames.initial }

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

  const leafStyle: React.CSSProperties = phase === 'initial' ? frames.initial : frames.final
  const isForward = direction === 'forward'

  const frontSrc = pages[0]
  const backSrc = pages[1]
  // Forward: at frame 0 we still see State A (blank left + cover right), so a
  //          blank phantom on the LEFT holds the resting cover-alone look
  //          until the leaf back face arrives.
  // Backward: at frame 0 we still see State B (pages[1] | pages[2]), so a
  //           pages[2] phantom on the RIGHT masks the static cover underneath
  //           until the leaf front face lands.
  const phantomSrc = isForward ? undefined : pages[2]
  const phantomSidePosition = isForward ? 'left-0' : 'right-0'

  return (
    <>
      <div
        aria-hidden="true"
        data-testid="page-flip-phantom"
        data-cover-phantom={isForward ? 'blank' : 'page'}
        className={[
          'absolute inset-y-0 w-1/2 overflow-hidden',
          phantomSidePosition,
          roundClass,
          isForward ? 'bg-slate-100 dark:bg-slate-950/40' : '',
        ].filter(Boolean).join(' ')}
      >
        {phantomSrc
          ? (
            <img
              src={phantomSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="h-full w-full object-cover"
            />
          )
          : null}
      </div>

      <div
        aria-hidden="true"
        data-testid="page-flip-outgoing"
        data-flip-phase={phase}
        data-cover-leaf="true"
        className="absolute inset-y-0 right-0 w-1/2 will-change-transform"
        style={{ ...leafStyle, transformStyle: 'preserve-3d' }}
      >
        {frontSrc
          ? (
            <img
              src={frontSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              data-testid="page-flip-outgoing-front"
              className={[
                'absolute inset-0 h-full w-full object-cover',
                roundClass,
              ].filter(Boolean).join(' ')}
              style={{ backfaceVisibility: 'hidden' }}
            />
          )
          : null}
        {backSrc
          ? (
            <img
              src={backSrc}
              alt=""
              aria-hidden="true"
              decoding="async"
              data-testid="page-flip-outgoing-back"
              className={[
                'absolute inset-0 h-full w-full object-cover',
                roundClass,
              ].filter(Boolean).join(' ')}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            />
          )
          : null}
      </div>
    </>
  )
}

const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}
