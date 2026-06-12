import clsx from 'clsx'

import type { TCoverMode } from '@v3/hooks/cover-mode'
import type { TViewMode } from '@v3/hooks/view-mode'

interface IStaticPageLayerProps {
  pages: string[]
  index: number
  mode: TViewMode
  coverMode: TCoverMode
  roundClass?: string
}

export default function StaticPageLayer({
  pages,
  index,
  mode,
  coverMode,
  roundClass = '',
}: IStaticPageLayerProps) {
  const coverAlone = mode === 'spread' && coverMode === 'single' && index === 0

  if (mode === 'single' || coverAlone) {
    const src = coverAlone ? pages[0] : pages[index]
    return (
      <div className={clsx('absolute inset-0 z-0 overflow-hidden', roundClass)}>
        {src
          ? (
            <img
              src={src}
              alt={`Page ${index + 1}`}
              decoding="async"
              data-testid="page-flip-current"
              className="h-full w-full object-cover"
            />
          )
          : null}
      </div>
    )
  }

  const leftSrc = pages[index]
  const rightSrc = pages[index + 1]

  return (
    <div
      data-testid="page-flip-current-spread"
      className={clsx('absolute inset-0 z-0 flex overflow-hidden', roundClass)}
    >
      {leftSrc
        ? (
          <img
            src={leftSrc}
            alt={`Page ${index + 1}`}
            decoding="async"
            data-testid="page-flip-current"
            className="h-full w-1/2 object-cover"
          />
        )
        : null}
      {rightSrc
        ? (
          <img
            src={rightSrc}
            alt={`Page ${index + 2}`}
            decoding="async"
            data-testid="page-flip-current-right"
            className="h-full w-1/2 object-cover"
          />
        )
        : (
          <div
            aria-hidden="true"
            data-testid="page-flip-current-right-empty"
            className="h-full w-1/2 bg-slate-100 dark:bg-slate-950/40"
          />
        )}
    </div>
  )
}
