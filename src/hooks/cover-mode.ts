import { useCallback, useEffect, useState } from 'react'

export type CoverMode = 'single' | 'spread'

export const COVER_MODE_STORAGE_KEY = 'book-flip-showcase:cover-mode'

const isCoverMode = (value: unknown): value is CoverMode =>
  value === 'single' || value === 'spread'

const detectInitialCoverMode = (): CoverMode => {
  if (typeof window === 'undefined') return 'single'
  try {
    const stored = window.localStorage.getItem(COVER_MODE_STORAGE_KEY)
    if (isCoverMode(stored)) return stored
  }
  catch {
    /* ignore storage errors */
  }
  return 'single'
}

export function useCoverMode() {
  const [coverMode, setCoverModeState] = useState<CoverMode>(() => detectInitialCoverMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(COVER_MODE_STORAGE_KEY, coverMode)
    }
    catch {
      /* ignore storage errors */
    }
  }, [coverMode])

  const setCoverMode = useCallback((next: CoverMode) => setCoverModeState(next), [])
  const toggleCoverMode = useCallback(() => {
    setCoverModeState((prev) => (prev === 'single' ? 'spread' : 'single'))
  }, [])

  return { coverMode, setCoverMode, toggleCoverMode }
}
