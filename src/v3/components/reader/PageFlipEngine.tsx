import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import type { TCoverMode } from '@v3/hooks/cover-mode'
import { useReducedMotion } from '@v3/hooks/reduced-motion'
import type { TViewMode } from '@v3/hooks/view-mode'
import { PageFlipSurface } from '@v3/lib/class-names'
import type { TFlipDirection } from '@v3/lib/curl-model'
import {
  createFlipProgressController,
  FLIP_DURATION_MS,
  formatFlipProgress,
} from '@v3/lib/flip-progress'

import CssCurlLeaf from './css-curl-leaf'
import GutterLighting from './gutter-lighting'
import StaticPageLayer from './static-page-layer'

const FLIP_PERSPECTIVE = '2200px'

interface IPageFlipEngineProps {
  pages: string[]
  pageIndex: number
  onPageChange?: (index: number) => void
  ariaLabel?: string
  mode?: TViewMode
  coverMode?: TCoverMode
  step?: 1 | 2
  rounded?: boolean
}

export default function PageFlipEngine({
  pages,
  pageIndex,
  onPageChange,
  ariaLabel = 'Book spread',
  mode = 'single',
  coverMode = 'spread',
  step: stepProp,
  rounded = false,
}: IPageFlipEngineProps) {
  const isCoverPage = (index: number): boolean =>
    mode === 'spread' && coverMode === 'single' && index === 0
  const safeIndex = Math.min(Math.max(pageIndex, 0), pages.length - 1)
  const defaultStep: 1 | 2 = mode === 'spread' ? (isCoverPage(safeIndex) ? 1 : 2) : 1
  const step: 1 | 2 = stepProp ?? defaultStep
  const roundClass = rounded ? 'rounded-2xl' : ''
  const reducedMotion = useReducedMotion()
  const duration = reducedMotion ? 0 : FLIP_DURATION_MS

  const [progress, setProgress] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(safeIndex)
  const [outgoing, setOutgoing] = useState<{
    index: number
    direction: TFlipDirection
  } | null>(null)
  const displayIndexRef = useRef(safeIndex)
  const lastIndexRef = useRef(safeIndex)
  const controllerRef = useRef(createFlipProgressController({ durationMs: duration }))

  useEffect(() => {
    controllerRef.current.cancel()
    controllerRef.current = createFlipProgressController({ durationMs: duration })
  }, [duration])

  useEffect(() => {
    if (safeIndex === lastIndexRef.current) return

    const prevIndex = displayIndexRef.current
    const targetIndex = safeIndex
    const direction: TFlipDirection = safeIndex > prevIndex ? 'forward' : 'backward'
    lastIndexRef.current = safeIndex

    controllerRef.current.cancel()
    setOutgoing({ index: prevIndex, direction })
    setProgress(0)

    controllerRef.current.start({
      onProgress: setProgress,
      onCommit: () => {
        if (lastIndexRef.current === targetIndex) {
          displayIndexRef.current = targetIndex
          setDisplayIndex(targetIndex)
        }
        setOutgoing(null)
        setProgress(0)
      },
    }, reducedMotion)
  }, [safeIndex, reducedMotion])

  useEffect(() => () => {
    controllerRef.current.cancel()
  }, [])

  const busy = outgoing !== null

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (busy) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offset = event.clientX - rect.left
    const rawNext = offset > rect.width / 2 ? safeIndex + step : safeIndex - step
    let next = rawNext
    if (next < 0) {
      if (safeIndex === 0) return
      next = 0
    }
    if (next >= pages.length) return
    onPageChange?.(next)
  }

  const resolveOutgoingLeaf = () => {
    if (!outgoing) return null

    const { index, direction } = outgoing
    const isForward = direction === 'forward'
    const spreadLeaf = mode === 'spread'

    if (spreadLeaf) {
      const frontSrc = isForward && !isCoverPage(index) ? pages[index + 1] : pages[index]
      const backSrc = isForward || isCoverPage(safeIndex)
        ? pages[safeIndex]
        : pages[safeIndex + 1]
      if (!frontSrc || !backSrc) return null
      return (
        <div
          className={clsx(
            'absolute inset-y-0 z-10 w-1/2',
            isForward ? 'right-0' : 'left-0',
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <CssCurlLeaf
            frontSrc={frontSrc}
            backSrc={backSrc}
            progress={progress}
            direction={direction}
            pivot={isForward ? 'left' : 'right'}
            roundClass={roundClass}
          />
        </div>
      )
    }

    const frontSrc = pages[index]
    const backSrc = pages[safeIndex]
    if (!frontSrc || !backSrc) return null
    return (
      <div
        className="absolute inset-0 z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <CssCurlLeaf
          frontSrc={frontSrc}
          backSrc={backSrc}
          progress={progress}
          direction={direction}
          pivot={isForward ? 'left' : 'right'}
          roundClass={roundClass}
        />
      </div>
    )
  }

  return (
    <div
      role="group"
      aria-label={`${ariaLabel}, page ${displayIndex + 1} of ${pages.length}`}
      data-testid="page-flip"
      data-flip-state={outgoing?.direction ?? 'idle'}
      data-flip-progress={formatFlipProgress(progress)}
      data-flip-renderer="css"
      data-view-mode={mode}
      tabIndex={0}
      onClick={handleClick}
      data-rounded={rounded ? 'true' : 'false'}
      className={clsx(
        PageFlipSurface,
        roundClass,
        mode === 'spread' ? 'aspect-[3/2] max-w-4xl' : 'aspect-[3/4] max-w-2xl',
      )}
      style={{ perspective: FLIP_PERSPECTIVE, transformStyle: 'preserve-3d' }}
    >
      <StaticPageLayer
        pages={pages}
        index={displayIndex}
        mode={mode}
        coverMode={coverMode}
        roundClass={roundClass}
      />
      {resolveOutgoingLeaf()}
      {mode === 'spread'
        ? (
          <GutterLighting
            progress={progress}
            direction={outgoing?.direction ?? 'forward'}
            active={busy}
          />
        )
        : null}
    </div>
  )
}
