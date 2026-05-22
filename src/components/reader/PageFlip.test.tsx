import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  describe('spread mode', () => {
    it('renders both left and right page images side by side', () => {
      render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" />)
      expect(screen.getByTestId('page-flip')).toHaveAttribute('data-view-mode', 'spread')
      expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/a.svg')
      expect(screen.getByTestId('page-flip-current-right')).toHaveAttribute('src', '/p/b.svg')
      expect(screen.getByTestId('page-flip-current-spread')).toBeInTheDocument()
    })

    it('clicking the right half advances by 2', () => {
      const onPageChange = vi.fn()
      render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" onPageChange={onPageChange} />)
      const board = screen.getByTestId('page-flip')
      setRectFor(board)
      fireEvent.click(board, { clientX: 500 })
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('clicking the left half retreats by 2', () => {
      const onPageChange = vi.fn()
      render(<PageFlip pages={PAGES} pageIndex={2} mode="spread" onPageChange={onPageChange} />)
      const board = screen.getByTestId('page-flip')
      setRectFor(board)
      fireEvent.click(board, { clientX: 100 })
      expect(onPageChange).toHaveBeenCalledWith(0)
    })

    it('renders an empty right slot when there is no trailing page', () => {
      render(<PageFlip pages={PAGES} pageIndex={4} mode="spread" />)
      expect(screen.queryByTestId('page-flip-current-right')).toBeNull()
      expect(screen.getByTestId('page-flip-current-right-empty')).toBeInTheDocument()
    })
  })

  describe('flip presets', () => {
    it('reflects the active preset on the surface via data-flip-preset', () => {
      render(<PageFlip pages={PAGES} pageIndex={0} presetId="tilt" />)
      expect(screen.getByTestId('page-flip')).toHaveAttribute('data-flip-preset', 'tilt')
    })

    it('mounts the outgoing leaf in the resting "initial" frame, then advances to "final" on the next RAF', async () => {
      vi.useRealTimers()
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} presetId="slide" />)
      rerender(<PageFlip pages={PAGES} pageIndex={1} presetId="slide" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing).toHaveAttribute('data-flip-phase', 'initial')
      expect(outgoing).toHaveStyle({ transform: 'translateX(0%)', opacity: '1' })

      await waitFor(() => expect(outgoing).toHaveAttribute('data-flip-phase', 'final'))
      expect(outgoing).toHaveStyle({ transform: 'translateX(-100%)', opacity: '0' })
    })

    it('animates the classic preset from no transform to rotateY in the final frame', async () => {
      vi.useRealTimers()
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} presetId="classic" />)
      rerender(<PageFlip pages={PAGES} pageIndex={1} presetId="classic" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing).toHaveStyle({ transform: 'none' })
      await waitFor(() => expect(outgoing).toHaveAttribute('data-flip-phase', 'final'))
      const styleAttr = outgoing.getAttribute('style') ?? ''
      expect(styleAttr).toMatch(/rotateY\(-180deg\)/)
    })

    it('applies the fade preset opacity-only transition to the outgoing leaf', async () => {
      vi.useRealTimers()
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} presetId="fade" />)
      rerender(<PageFlip pages={PAGES} pageIndex={1} presetId="fade" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing).toHaveStyle({ opacity: '1' })
      await waitFor(() => expect(outgoing).toHaveAttribute('data-flip-phase', 'final'))
      const style = outgoing.getAttribute('style') ?? ''
      expect(style).toContain('opacity')
      expect(style).not.toMatch(/transform:[^;]*rotate/)
    })
  })
})
