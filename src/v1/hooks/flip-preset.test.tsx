import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FLIP_PRESET_STORAGE_KEY, useFlipPreset } from './flip-preset'

const setReducedMotion = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce') ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

beforeEach(() => {
  window.localStorage.clear()
  setReducedMotion(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useFlipPreset', () => {
  it('defaults to classic when nothing is stored', () => {
    const { result } = renderHook(() => useFlipPreset())
    expect(result.current.preset).toBe('classic')
    expect(result.current.effectivePreset).toBe('classic')
  })

  it('restores a stored preset', () => {
    window.localStorage.setItem(FLIP_PRESET_STORAGE_KEY, 'curl')
    const { result } = renderHook(() => useFlipPreset())
    expect(result.current.preset).toBe('curl')
    expect(result.current.effectivePreset).toBe('curl')
  })

  it('ignores invalid stored values and falls back to classic', () => {
    window.localStorage.setItem(FLIP_PRESET_STORAGE_KEY, 'mystery')
    const { result } = renderHook(() => useFlipPreset())
    expect(result.current.preset).toBe('classic')
  })

  it('setPreset persists the chosen preset', () => {
    const { result } = renderHook(() => useFlipPreset())
    act(() => result.current.setPreset('tilt'))
    expect(window.localStorage.getItem(FLIP_PRESET_STORAGE_KEY)).toBe('tilt')
    expect(result.current.preset).toBe('tilt')
  })

  it('forces fade as the effective preset when the user prefers reduced motion', () => {
    setReducedMotion(true)
    window.localStorage.setItem(FLIP_PRESET_STORAGE_KEY, 'tilt')
    const { result } = renderHook(() => useFlipPreset())
    expect(result.current.preset).toBe('tilt')
    expect(result.current.effectivePreset).toBe('fade')
    expect(result.current.reducedMotionOverride).toBe(true)
  })
})
