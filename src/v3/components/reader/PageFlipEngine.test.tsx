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
    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/b.svg')
  })

  test('commits the target page only after the flip animation completes', () => {
    let frameCallback: FrameRequestCallback | undefined
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameCallback = callback
      return 1
    })

    const { rerender } = render(<PageFlipEngine pages={PAGES} pageIndex={1} />)

    act(() => {
      rerender(<PageFlipEngine pages={PAGES} pageIndex={2} />)
    })

    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/b.svg')

    act(() => {
      frameCallback?.(0)
      frameCallback?.(700)
    })

    expect(screen.queryByTestId('page-flip-outgoing')).not.toBeInTheDocument()
    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/c.svg')
    expect(screen.getByTestId('page-flip')).toHaveAccessibleName(/page 3 of 5/i)
  })

  test('keeps a single cover in the right page slot in spread mode', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1)

    render(
      <PageFlipEngine
        pages={PAGES}
        pageIndex={0}
        mode="spread"
        coverMode="single"
      />,
    )

    expect(screen.getByTestId('page-flip-current-cover-blank').className).toMatch(/\bw-1\/2\b/)
    expect(screen.getByTestId('page-flip-current').className).toMatch(/\bw-1\/2\b/)
    expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/a.svg')
  })

  test('uses a half-width leaf and progress-driven gutter lighting for cover turns', () => {
    vi.stubGlobal('requestAnimationFrame', () => 1)

    const { rerender } = render(
      <PageFlipEngine
        pages={PAGES}
        pageIndex={0}
        mode="spread"
        coverMode="single"
      />,
    )

    act(() => {
      rerender(
        <PageFlipEngine
          pages={PAGES}
          pageIndex={1}
          mode="spread"
          coverMode="single"
        />,
      )
    })

    expect(screen.getByTestId('page-flip-outgoing').parentElement?.className).toMatch(/\bw-1\/2\b/)
    expect(screen.getByTestId('page-flip-outgoing')).toHaveAttribute('src', '/p/a.svg')
    expect(screen.getByTestId('page-flip-gutter')).toHaveAttribute('data-flip-phase', 'active')
    expect(screen.getByTestId('page-flip-gutter-cast')).toHaveStyle({ opacity: '0' })
  })
})
