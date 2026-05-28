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

    it('spread-mode outgoing leaf is a single half-width two-faced leaf, not the whole spread', async () => {
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" />)
      rerender(<PageFlip pages={PAGES} pageIndex={2} mode="spread" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.className).toMatch(/\bw-1\/2\b/)
      // Front face shows the OLD right page (pages[1]); back face shows the NEW left page (pages[2]).
      expect(screen.getByTestId('page-flip-outgoing-front')).toHaveAttribute('src', '/p/b.svg')
      expect(screen.getByTestId('page-flip-outgoing-back')).toHaveAttribute('src', '/p/c.svg')
      // A phantom half-width layer on the OPPOSITE side covers the old left page until the leaf back arrives.
      const phantom = screen.getByTestId('page-flip-phantom')
      expect(phantom.className).toMatch(/\bw-1\/2\b/)
      expect(phantom.querySelector('img')).toHaveAttribute('src', '/p/a.svg')
    })

    it('spread-mode forward leaf sits on the right half and pivots at the left (spine)', () => {
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" />)
      rerender(<PageFlip pages={PAGES} pageIndex={2} mode="spread" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.className).toMatch(/\bright-0\b/)
      expect(screen.getByTestId('page-flip-phantom').className).toMatch(/\bleft-0\b/)
      expect(outgoing).toHaveStyle({ transformOrigin: 'left center' })
    })

    it('spread-mode backward leaf sits on the left half and pivots at the right (spine)', () => {
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={2} mode="spread" />)
      rerender(<PageFlip pages={PAGES} pageIndex={0} mode="spread" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.className).toMatch(/\bleft-0\b/)
      expect(screen.getByTestId('page-flip-phantom').className).toMatch(/\bright-0\b/)
      expect(outgoing).toHaveStyle({ transformOrigin: 'right center' })
    })

    it('leaf wrapper keeps preserve-3d and never sets overflow-hidden so the back face can paint past 90° (#49)', () => {
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" />)
      rerender(<PageFlip pages={PAGES} pageIndex={2} mode="spread" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.className).not.toMatch(/\boverflow-hidden\b/)
      expect(outgoing).toHaveStyle({ transformStyle: 'preserve-3d' })
    })

    it('rounded class is applied to the leaf faces (not the wrapper) so 3D rendering survives clipping (#49)', () => {
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" rounded />)
      rerender(<PageFlip pages={PAGES} pageIndex={2} mode="spread" rounded />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.className).not.toMatch(/\brounded-2xl\b/)
      expect(screen.getByTestId('page-flip-outgoing-front').className).toMatch(/\brounded-2xl\b/)
      expect(screen.getByTestId('page-flip-outgoing-back').className).toMatch(/\brounded-2xl\b/)
    })
  })

  describe('rounded-corners toggle', () => {
    it('defaults to sharp corners (no rounded-2xl class) for a real-book look', () => {
      render(<PageFlip pages={PAGES} pageIndex={0} />)
      const surface = screen.getByTestId('page-flip')
      expect(surface).toHaveAttribute('data-rounded', 'false')
      expect(surface.className).not.toMatch(/\brounded-2xl\b/)
      const page = screen.getByTestId('page-flip-current')
      expect(page.className).not.toMatch(/\brounded-2xl\b/)
    })

    it('paints rounded-2xl on the board and the page surface when rounded=true', () => {
      render(<PageFlip pages={PAGES} pageIndex={0} rounded />)
      const surface = screen.getByTestId('page-flip')
      expect(surface).toHaveAttribute('data-rounded', 'true')
      expect(surface.className).toMatch(/\brounded-2xl\b/)
      const page = screen.getByTestId('page-flip-current')
      expect(page.className).toMatch(/\brounded-2xl\b/)
    })
  })

  describe('cover-alone (coverMode=single in spread mode)', () => {
    it('renders only the cover on the right half with a blank left half', () => {
      render(<PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" />)
      expect(screen.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'true')
      expect(screen.getByTestId('page-flip-current-cover-blank')).toBeInTheDocument()
      expect(screen.getByTestId('page-flip-current')).toHaveAttribute('src', '/p/a.svg')
      expect(screen.queryByTestId('page-flip-current-right')).toBeNull()
    })

    it('clicking the right half advances by 1 step (cover → first spread)', () => {
      const onPageChange = vi.fn()
      render(
        <PageFlip
          pages={PAGES}
          pageIndex={0}
          mode="spread"
          coverMode="single"
          step={1}
          onPageChange={onPageChange}
        />,
      )
      const board = screen.getByTestId('page-flip')
      setRectFor(board)
      fireEvent.click(board, { clientX: 500 })
      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('cover-alone flag turns off once we navigate to a real spread', () => {
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" />,
      )
      expect(screen.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'true')
      rerender(<PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" />)
      expect(screen.getByTestId('page-flip')).toHaveAttribute('data-cover-alone', 'false')
      expect(screen.getByTestId('page-flip-current-right')).toHaveAttribute('src', '/p/c.svg')
    })

    it('clicking the left half of the first spread snaps back to the cover (#53)', () => {
      const onPageChange = vi.fn()
      render(
        <PageFlip
          pages={PAGES}
          pageIndex={1}
          mode="spread"
          coverMode="single"
          step={2}
          onPageChange={onPageChange}
        />,
      )
      const board = screen.getByTestId('page-flip')
      setRectFor(board)
      fireEvent.click(board, { clientX: 100 })
      expect(onPageChange).toHaveBeenCalledWith(0)
    })

    it('still does not navigate past the start when clicking the left half at the cover itself', () => {
      const onPageChange = vi.fn()
      render(
        <PageFlip
          pages={PAGES}
          pageIndex={0}
          mode="spread"
          coverMode="single"
          step={1}
          onPageChange={onPageChange}
        />,
      )
      const board = screen.getByTestId('page-flip')
      setRectFor(board)
      fireEvent.click(board, { clientX: 100 })
      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('cover-boundary leaf (#52)', () => {
    it('forward 0 → 1 mounts a half-width cover leaf on the right with the cover on the front and pages[1] on the back', () => {
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" />,
      )
      rerender(<PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" />)
      const leaf = screen.getByTestId('page-flip-outgoing')
      expect(leaf).toHaveAttribute('data-cover-leaf', 'true')
      expect(leaf.className).toMatch(/\bw-1\/2\b/)
      expect(leaf.className).toMatch(/\bright-0\b/)
      expect(screen.getByTestId('page-flip-outgoing-front')).toHaveAttribute('src', '/p/a.svg')
      expect(screen.getByTestId('page-flip-outgoing-back')).toHaveAttribute('src', '/p/b.svg')
      const phantom = screen.getByTestId('page-flip-phantom')
      expect(phantom).toHaveAttribute('data-cover-phantom', 'blank')
      expect(phantom.className).toMatch(/\bleft-0\b/)
      expect(phantom.querySelector('img')).toBeNull()
    })

    it('backward 1 → 0 keeps the leaf on the right half (cover lands back on the right) and the phantom holds pages[2] on the right', () => {
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" />,
      )
      rerender(<PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" />)
      const leaf = screen.getByTestId('page-flip-outgoing')
      expect(leaf).toHaveAttribute('data-cover-leaf', 'true')
      expect(leaf.className).toMatch(/\bright-0\b/)
      expect(screen.getByTestId('page-flip-outgoing-front')).toHaveAttribute('src', '/p/a.svg')
      expect(screen.getByTestId('page-flip-outgoing-back')).toHaveAttribute('src', '/p/b.svg')
      const phantom = screen.getByTestId('page-flip-phantom')
      expect(phantom).toHaveAttribute('data-cover-phantom', 'page')
      expect(phantom.className).toMatch(/\bright-0\b/)
      expect(phantom.querySelector('img')).toHaveAttribute('src', '/p/c.svg')
    })

    it('cover leaf preserves 3D rendering so the back face can paint (#49 regression)', async () => {
      vi.useRealTimers()
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" presetId="classic" />,
      )
      rerender(
        <PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" presetId="classic" />,
      )
      const leaf = screen.getByTestId('page-flip-outgoing')
      expect(leaf.className).not.toMatch(/\boverflow-hidden\b/)
      expect(leaf).toHaveStyle({ transformStyle: 'preserve-3d' })
    })

    it('backward cover leaf reverses the rotation — initial transform is the spread final, final is the resting frame', async () => {
      vi.useRealTimers()
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" presetId="classic" />,
      )
      rerender(
        <PageFlip pages={PAGES} pageIndex={0} mode="spread" coverMode="single" presetId="classic" />,
      )
      const leaf = screen.getByTestId('page-flip-outgoing')
      expect(leaf.getAttribute('style') ?? '').toMatch(/rotateY\(-180deg\)/)
      await waitFor(() => expect(leaf).toHaveAttribute('data-flip-phase', 'final'))
      const finalStyle = leaf.getAttribute('style') ?? ''
      expect(finalStyle).toMatch(/rotateY\(0deg\)/)
    })

    it('deeper navigation (spread → spread, no cover involved) still uses the regular spread leaf, not the cover leaf', () => {
      const { rerender } = render(
        <PageFlip pages={PAGES} pageIndex={1} mode="spread" coverMode="single" />,
      )
      rerender(<PageFlip pages={PAGES} pageIndex={3} mode="spread" coverMode="single" />)
      const leaf = screen.getByTestId('page-flip-outgoing')
      expect(leaf).not.toHaveAttribute('data-cover-leaf')
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

    it('animates the classic preset from resting paper transform to rotateY in the final frame', async () => {
      vi.useRealTimers()
      const { rerender } = render(<PageFlip pages={PAGES} pageIndex={0} presetId="classic" />)
      rerender(<PageFlip pages={PAGES} pageIndex={1} presetId="classic" />)
      const outgoing = screen.getByTestId('page-flip-outgoing')
      expect(outgoing.getAttribute('style') ?? '').toMatch(/rotateY\(0deg\)/)
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
