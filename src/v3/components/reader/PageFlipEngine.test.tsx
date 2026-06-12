import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import PageFlipEngine from './PageFlipEngine'

const PAGES = ['/p/a.svg', '/p/b.svg', '/p/c.svg', '/p/d.svg', '/p/e.svg']

beforeEach(() => {
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PageFlipEngine', () => {
  test('renders the current page and css renderer metadata', () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    render(<PageFlipEngine pages={PAGES} pageIndex={1} />)
    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-renderer', 'css')
    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-progress', '0.000')
    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/b.svg')
  })

  test('exposes flip direction while a page change is in flight', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1)

    const { rerender } = render(<PageFlipEngine pages={PAGES} pageIndex={1} />)

    act(() => {
      rerender(<PageFlipEngine pages={PAGES} pageIndex={2} />)
    })

    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-state', 'forward')
    expect(screen.getByTestId('page-flip-outgoing')).toBeInTheDocument()
    expect(screen.getByTestId('page-flip-outgoing').tagName).toBe('IMG')
    expect(screen.getByTestId('page-flip-outgoing').children).toHaveLength(0)
    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/c.svg')
  })
})
