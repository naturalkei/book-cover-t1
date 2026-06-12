import { useCallback, useEffect, useState } from 'react'

export type TCoverMode = 'single' | 'spread'

export const COVER_MODE_STORAGE_KEY = 'book-flip-showcase:v3:cover-mode'

const isCoverMode = (value: unknown): value is TCoverMode =>
  value === 'single' || value === 'spread'

const detectInitialCoverMode = (): TCoverMode => {
  if (typeof window === 'undefined') return 'single'
  try {
    const stored = window.localStorage.getItem(COVER_MODE_STORAGE_KEY)
    if (isCoverMode(stored)) return stored
  }
  catch {
    /* ignore */
  }
  return 'single'
}

export function useCoverMode() {
  const [coverMode, setCoverModeState] = useState<TCoverMode>(() => detectInitialCoverMode())

  useEffect(() => {
    try {
      window.localStorage.setItem(COVER_MODE_STORAGE_KEY, coverMode)
    }
    catch {
      /* ignore */
    }
  }, [coverMode])

  const setCoverMode = useCallback((next: TCoverMode) => setCoverModeState(next), [])

  return { coverMode, setCoverMode }
}
