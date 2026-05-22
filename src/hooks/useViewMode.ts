import { useCallback, useEffect, useState } from 'react'

export type ViewMode = 'single' | 'spread'

export const VIEW_MODE_STORAGE_KEY = 'book-flip-showcase:view-mode'
export const VIEW_MODE_BREAKPOINT = '(min-width: 1024px)'

const isViewMode = (value: unknown): value is ViewMode =>
  value === 'single' || value === 'spread'

const detectInitialViewMode = (): ViewMode => {
  if (typeof window === 'undefined') return 'single'
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (isViewMode(stored)) return stored
  }
  catch {
    /* ignore storage errors (private mode, disabled storage) */
  }
  if (window.matchMedia?.(VIEW_MODE_BREAKPOINT).matches) return 'spread'
  return 'single'
}

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => detectInitialViewMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
    }
    catch {
      /* ignore storage errors */
    }
  }, [viewMode])

  const setViewMode = useCallback((next: ViewMode) => setViewModeState(next), [])
  const toggleViewMode = useCallback(() => {
    setViewModeState((prev) => (prev === 'single' ? 'spread' : 'single'))
  }, [])

  return { viewMode, setViewMode, toggleViewMode }
}

export const stepForMode = (mode: ViewMode): 1 | 2 => (mode === 'spread' ? 2 : 1)

export const snapToStep = (pageIndex: number, step: number): number => {
  if (step <= 1) return Math.max(0, pageIndex)
  return Math.max(0, pageIndex - (pageIndex % step))
}
