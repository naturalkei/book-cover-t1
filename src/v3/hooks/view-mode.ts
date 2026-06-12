import { useCallback, useEffect, useState } from 'react'

import type { TCoverMode } from './cover-mode'

export type TViewMode = 'single' | 'spread'

export const VIEW_MODE_STORAGE_KEY = 'book-flip-showcase:v3:view-mode'
export const VIEW_MODE_BREAKPOINT = '(min-width: 1024px)'

const isViewMode = (value: unknown): value is TViewMode =>
  value === 'single' || value === 'spread'

const detectInitialViewMode = (): TViewMode => {
  if (typeof window === 'undefined') return 'single'
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
    if (isViewMode(stored)) return stored
  }
  catch {
    /* ignore */
  }
  if (window.matchMedia?.(VIEW_MODE_BREAKPOINT).matches) return 'spread'
  return 'single'
}

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<TViewMode>(() => detectInitialViewMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
    }
    catch {
      /* ignore */
    }
  }, [viewMode])

  const setViewMode = useCallback((next: TViewMode) => setViewModeState(next), [])

  return { viewMode, setViewMode }
}

export const snapPage = (
  pageIndex: number,
  mode: TViewMode,
  coverMode: TCoverMode = 'spread',
): number => {
  if (pageIndex <= 0) return 0
  if (mode === 'single') return pageIndex
  if (coverMode === 'spread') return pageIndex - (pageIndex % 2)
  if (pageIndex === 1) return 1
  return pageIndex % 2 === 1 ? pageIndex : pageIndex - 1
}

export const getEffectiveStep = (
  pageIndex: number,
  mode: TViewMode,
  coverMode: TCoverMode = 'spread',
): 1 | 2 => {
  if (mode === 'single') return 1
  if (coverMode === 'spread') return 2
  return pageIndex === 0 ? 1 : 2
}

export const isCoverAlone = (
  pageIndex: number,
  mode: TViewMode,
  coverMode: TCoverMode = 'spread',
): boolean => mode === 'spread' && coverMode === 'single' && pageIndex === 0
