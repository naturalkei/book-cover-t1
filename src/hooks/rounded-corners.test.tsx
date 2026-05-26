import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ROUNDED_CORNERS_STORAGE_KEY, useRoundedCorners } from './rounded-corners'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('useRoundedCorners', () => {
  it('defaults to false (real-book look) when nothing is stored', () => {
    const { result } = renderHook(() => useRoundedCorners())
    expect(result.current.rounded).toBe(false)
  })

  it('restores the stored preference', () => {
    window.localStorage.setItem(ROUNDED_CORNERS_STORAGE_KEY, 'true')
    const { result } = renderHook(() => useRoundedCorners())
    expect(result.current.rounded).toBe(true)
  })

  it('ignores invalid stored values', () => {
    window.localStorage.setItem(ROUNDED_CORNERS_STORAGE_KEY, 'maybe')
    const { result } = renderHook(() => useRoundedCorners())
    expect(result.current.rounded).toBe(false)
  })

  it('setRounded sets and persists', () => {
    const { result } = renderHook(() => useRoundedCorners())
    act(() => result.current.setRounded(true))
    expect(result.current.rounded).toBe(true)
    expect(window.localStorage.getItem(ROUNDED_CORNERS_STORAGE_KEY)).toBe('true')
  })

  it('toggleRounded flips and persists', () => {
    const { result } = renderHook(() => useRoundedCorners())
    act(() => result.current.toggleRounded())
    expect(result.current.rounded).toBe(true)
    act(() => result.current.toggleRounded())
    expect(result.current.rounded).toBe(false)
  })
})
