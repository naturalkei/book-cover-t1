import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  snapToStep,
  stepForMode,
  useViewMode,
  VIEW_MODE_BREAKPOINT,
  VIEW_MODE_STORAGE_KEY,
} from './useViewMode'

const setMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === VIEW_MODE_BREAKPOINT ? matches : false,
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
  setMatchMedia(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useViewMode', () => {
  it('defaults to single when nothing is stored and the viewport is narrow', () => {
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('single')
  })

  it('defaults to spread on lg+ viewports when nothing is stored', () => {
    setMatchMedia(true)
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('spread')
  })

  it('restores the stored preference', () => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'spread')
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('spread')
  })

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, 'bogus')
    const { result } = renderHook(() => useViewMode())
    expect(result.current.viewMode).toBe('single')
  })

  it('toggleViewMode flips between single and spread and persists', () => {
    const { result } = renderHook(() => useViewMode())
    act(() => result.current.toggleViewMode())
    expect(result.current.viewMode).toBe('spread')
    expect(window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('spread')
    act(() => result.current.toggleViewMode())
    expect(result.current.viewMode).toBe('single')
    expect(window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('single')
  })

  it('setViewMode sets and persists a specific mode', () => {
    const { result } = renderHook(() => useViewMode())
    act(() => result.current.setViewMode('spread'))
    expect(window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)).toBe('spread')
  })
})

describe('stepForMode', () => {
  it('returns 1 for single', () => {
    expect(stepForMode('single')).toBe(1)
  })
  it('returns 2 for spread', () => {
    expect(stepForMode('spread')).toBe(2)
  })
})

describe('snapToStep', () => {
  it('is identity for step 1', () => {
    expect(snapToStep(3, 1)).toBe(3)
  })
  it('rounds down to the nearest multiple of step', () => {
    expect(snapToStep(0, 2)).toBe(0)
    expect(snapToStep(1, 2)).toBe(0)
    expect(snapToStep(2, 2)).toBe(2)
    expect(snapToStep(5, 2)).toBe(4)
  })
  it('clamps negatives to zero', () => {
    expect(snapToStep(-3, 2)).toBe(0)
  })
})
