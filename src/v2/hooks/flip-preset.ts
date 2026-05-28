import { useCallback, useEffect, useState } from 'react'

import {
  DEFAULT_FLIP_PRESET,
  isFlipPresetId,
  REDUCED_MOTION_PRESET,
  type TFlipPresetId,
} from '@v2/components/reader/flip-presets'

import { useReducedMotion } from './reduced-motion'

export const FLIP_PRESET_STORAGE_KEY = 'book-flip-showcase:v2:flip-preset'

const detectInitialPreset = (): TFlipPresetId => {
  if (typeof window === 'undefined') return DEFAULT_FLIP_PRESET
  try {
    const stored = window.localStorage.getItem(FLIP_PRESET_STORAGE_KEY)
    if (isFlipPresetId(stored)) return stored
  }
  catch {
    /* ignore storage errors (private mode, disabled storage) */
  }
  return DEFAULT_FLIP_PRESET
}

export function useFlipPreset() {
  const [preset, setPresetState] = useState<TFlipPresetId>(() => detectInitialPreset())
  const reducedMotion = useReducedMotion()
  const effectivePreset: TFlipPresetId = reducedMotion ? REDUCED_MOTION_PRESET : preset

  useEffect(() => {
    try {
      window.localStorage.setItem(FLIP_PRESET_STORAGE_KEY, preset)
    }
    catch {
      /* ignore storage errors */
    }
  }, [preset])

  const setPreset = useCallback((next: TFlipPresetId) => setPresetState(next), [])

  return { preset, effectivePreset, setPreset, reducedMotionOverride: reducedMotion }
}
