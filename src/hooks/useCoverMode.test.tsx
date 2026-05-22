import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { COVER_MODE_STORAGE_KEY, useCoverMode } from './useCoverMode'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('useCoverMode', () => {
  it('defaults to single when nothing is stored', () => {
    const { result } = renderHook(() => useCoverMode())
    expect(result.current.coverMode).toBe('single')
  })

  it('restores the stored preference', () => {
    window.localStorage.setItem(COVER_MODE_STORAGE_KEY, 'spread')
    const { result } = renderHook(() => useCoverMode())
    expect(result.current.coverMode).toBe('spread')
  })

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(COVER_MODE_STORAGE_KEY, 'bogus')
    const { result } = renderHook(() => useCoverMode())
    expect(result.current.coverMode).toBe('single')
  })

  it('setCoverMode sets and persists', () => {
    const { result } = renderHook(() => useCoverMode())
    act(() => result.current.setCoverMode('spread'))
    expect(result.current.coverMode).toBe('spread')
    expect(window.localStorage.getItem(COVER_MODE_STORAGE_KEY)).toBe('spread')
  })

  it('toggleCoverMode flips between values and persists', () => {
    const { result } = renderHook(() => useCoverMode())
    act(() => result.current.toggleCoverMode())
    expect(result.current.coverMode).toBe('spread')
    act(() => result.current.toggleCoverMode())
    expect(result.current.coverMode).toBe('single')
    expect(window.localStorage.getItem(COVER_MODE_STORAGE_KEY)).toBe('single')
  })
})
