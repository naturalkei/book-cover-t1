import { useCallback, useEffect, useState } from 'react'

export const ROUNDED_CORNERS_STORAGE_KEY = 'book-flip-showcase:v2:rounded-corners'

const detectInitial = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(ROUNDED_CORNERS_STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
  }
  catch {
    /* ignore storage errors */
  }
  return false
}

export function useRoundedCorners() {
  const [rounded, setRoundedState] = useState<boolean>(() => detectInitial())

  useEffect(() => {
    try {
      window.localStorage.setItem(ROUNDED_CORNERS_STORAGE_KEY, String(rounded))
    }
    catch {
      /* ignore storage errors */
    }
  }, [rounded])

  const setRounded = useCallback((next: boolean) => setRoundedState(next), [])
  const toggleRounded = useCallback(() => setRoundedState((prev) => !prev), [])

  return { rounded, setRounded, toggleRounded }
}
