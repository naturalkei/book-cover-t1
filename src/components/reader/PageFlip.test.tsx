import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PageFlip from './PageFlip'

const PAGES = ['/p/a.svg', '/p/b.svg', '/p/c.svg', '/p/d.svg', '/p/e.svg']

const setRectFor = (el: HTMLElement, width = 600) => {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 800,
    top: 0,
    left: 0,
    right: width,
    bottom: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('PageFlip', () => {
  it('renders the current page image with descriptive alt text', () => {
    render(<PageFlip pages={PAGES} pageIndex={0} />)
    const img = screen.getByAltText(/page 1/i)
    expect(img).toHaveAttribute('src', '/p/a.svg')
  })

  it('updates the displayed page when pageIndex changes', () => {
    const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} />)
    rerender(<PageFlip pages={PAGES} pageIndex={2} />)
    expect(screen.getByAltText(/page 3/i)).toHaveAttribute('src', '/p/c.svg')
  })

  it('exposes flip direction via data-flip-state during the animation', () => {
    const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} />)
    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-state', 'idle')
    rerender(<PageFlip pages={PAGES} pageIndex={1} />)
    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-state', 'forward')
    act(() => {
      vi.runAllTimers()
    })
    expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-state', 'idle')
  })

  it('calls onPageChange with the next index when the right half is clicked', () => {
    const onPageChange = vi.fn()
    render(<PageFlip pages={PAGES} pageIndex={1} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    setRectFor(board)
    fireEvent.click(board, { clientX: 500 })
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with the previous index when the left half is clicked', () => {
    const onPageChange = vi.fn()
    render(<PageFlip pages={PAGES} pageIndex={1} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    setRectFor(board)
    fireEvent.click(board, { clientX: 100 })
    expect(onPageChange).toHaveBeenCalledWith(0)
  })

  it('does not flip past the last page', () => {
    const onPageChange = vi.fn()
    render(<PageFlip pages={PAGES} pageIndex={PAGES.length - 1} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    setRectFor(board)
    fireEvent.click(board, { clientX: 500 })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('does not flip before the first page', () => {
    const onPageChange = vi.fn()
    render(<PageFlip pages={PAGES} pageIndex={0} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    setRectFor(board)
    fireEvent.click(board, { clientX: 100 })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores clicks while an animation is in progress', () => {
    const onPageChange = vi.fn()
    const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} onPageChange={onPageChange} />)
    rerender(<PageFlip pages={PAGES} pageIndex={1} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    setRectFor(board)
    fireEvent.click(board, { clientX: 500 })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('advances on Enter key press', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<PageFlip pages={PAGES} pageIndex={0} onPageChange={onPageChange} />)
    const board = screen.getByTestId('page-flip')
    board.focus()
    await user.keyboard('{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('preloads pages within a ±2 window via the Image constructor', () => {
    const created: string[] = []
    const RealImage = window.Image
    window.Image = vi.fn().mockImplementation(function FakeImage(this: HTMLImageElement) {
      Object.defineProperty(this, 'src', {
        set(value: string) {
          created.push(value)
        },
      })
    }) as unknown as typeof Image
    try {
      render(<PageFlip pages={PAGES} pageIndex={2} />)
      expect(created).toEqual(
        expect.arrayContaining(['/p/a.svg', '/p/b.svg', '/p/d.svg', '/p/e.svg']),
      )
      expect(created).not.toContain('/p/c.svg')
    }
    finally {
      window.Image = RealImage
    }
  })

  it('flags the current page image as high priority and eager', () => {
    render(<PageFlip pages={PAGES} pageIndex={0} />)
    const current = screen.getByTestId('page-flip-current')
    expect(current).toHaveAttribute('loading', 'eager')
    expect(current).toHaveAttribute('decoding', 'async')
    expect(current).toHaveAttribute('fetchpriority', 'high')
  })
})
