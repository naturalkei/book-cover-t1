import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  effectiveStep,
  isCoverAlone,
  snapPage,
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

describe('snapPage (cover-aware)', () => {
  it('is identity for single mode at any index', () => {
    expect(snapPage(0, 'single')).toBe(0)
    expect(snapPage(3, 'single')).toBe(3)
    expect(snapPage(7, 'single')).toBe(7)
  })

  it('snaps to even starts in spread mode with coverMode=spread', () => {
    expect(snapPage(0, 'spread', 'spread')).toBe(0)
    expect(snapPage(1, 'spread', 'spread')).toBe(0)
    expect(snapPage(2, 'spread', 'spread')).toBe(2)
    expect(snapPage(5, 'spread', 'spread')).toBe(4)
  })

  it('snaps cover (0) alone, then odd starts in spread + coverMode=single', () => {
    expect(snapPage(0, 'spread', 'single')).toBe(0)
    expect(snapPage(1, 'spread', 'single')).toBe(1)
    expect(snapPage(2, 'spread', 'single')).toBe(1)
    expect(snapPage(3, 'spread', 'single')).toBe(3)
    expect(snapPage(4, 'spread', 'single')).toBe(3)
    expect(snapPage(5, 'spread', 'single')).toBe(5)
  })

  it('clamps negative indices to zero across modes', () => {
    expect(snapPage(-1, 'single')).toBe(0)
    expect(snapPage(-3, 'spread', 'spread')).toBe(0)
    expect(snapPage(-3, 'spread', 'single')).toBe(0)
  })
})

describe('effectiveStep (cover-aware)', () => {
  it('is 1 for single mode regardless of index', () => {
    expect(effectiveStep(0, 'single')).toBe(1)
    expect(effectiveStep(5, 'single', 'single')).toBe(1)
  })

  it('is 2 across the whole spread in coverMode=spread', () => {
    expect(effectiveStep(0, 'spread', 'spread')).toBe(2)
    expect(effectiveStep(4, 'spread', 'spread')).toBe(2)
  })

  it('is 1 only at the cover (index 0) and 2 elsewhere in coverMode=single', () => {
    expect(effectiveStep(0, 'spread', 'single')).toBe(1)
    expect(effectiveStep(1, 'spread', 'single')).toBe(2)
    expect(effectiveStep(3, 'spread', 'single')).toBe(2)
  })
})

describe('isCoverAlone', () => {
  it('is true only for index 0 in spread + coverMode=single', () => {
    expect(isCoverAlone(0, 'spread', 'single')).toBe(true)
    expect(isCoverAlone(1, 'spread', 'single')).toBe(false)
    expect(isCoverAlone(0, 'spread', 'spread')).toBe(false)
    expect(isCoverAlone(0, 'single', 'single')).toBe(false)
  })
})
