import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ThumbnailScrubber from './ThumbnailScrubber'

const buildPages = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/p/${i + 1}.svg`)

describe('ThumbnailScrubber', () => {
  it('renders a thumbnail button per page for short books', () => {
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={0} onPageChange={() => {}} />,
    )
    const list = screen.getByRole('list', { name: /page thumbnails/i })
    expect(list.children).toHaveLength(8)
  })

  it('marks the current thumbnail with aria-current="page"', () => {
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={3} onPageChange={() => {}} />,
    )
    const current = screen.getByTestId('scrubber-thumb-3')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.getByTestId('scrubber-thumb-0')).not.toHaveAttribute('aria-current')
  })

  it('jumps to a page when a thumbnail is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={0} onPageChange={onPageChange} />,
    )
    await user.click(screen.getByTestId('scrubber-thumb-5'))
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('previews during pointer drag and commits on pointer up', () => {
    const onPageChange = vi.fn()
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={0} onPageChange={onPageChange} />,
    )
    const slider = screen.getByRole('slider', { name: /scrub to page/i })
    fireEvent.pointerDown(slider)
    fireEvent.change(slider, { target: { value: '4' } })
    expect(onPageChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('scrubber-preview')).toHaveTextContent(/page 5/i)
    fireEvent.pointerUp(slider)
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('commits immediately on change without pointer drag (keyboard)', () => {
    const onPageChange = vi.fn()
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={2} onPageChange={onPageChange} />,
    )
    const slider = screen.getByRole('slider', { name: /scrub to page/i })
    fireEvent.change(slider, { target: { value: '5' } })
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('does not commit when releasing on the same page', () => {
    const onPageChange = vi.fn()
    render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={3} onPageChange={onPageChange} />,
    )
    const slider = screen.getByRole('slider', { name: /scrub to page/i })
    fireEvent.pointerDown(slider)
    fireEvent.change(slider, { target: { value: '3' } })
    fireEvent.pointerUp(slider)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('virtualizes thumbnails for books with more than 50 pages', () => {
    render(
      <ThumbnailScrubber
        pages={buildPages(120)}
        pageIndex={60}
        thumbnailWindow={5}
        onPageChange={() => {}}
      />,
    )
    const list = screen.getByRole('list', { name: /page thumbnails/i })
    expect(list.children.length).toBeLessThanOrEqual(11)
    expect(screen.getByTestId('scrubber-thumb-60')).toBeInTheDocument()
    expect(screen.queryByTestId('scrubber-thumb-0')).toBeNull()
  })

  it('syncs the slider when pageIndex changes externally', () => {
    const { rerender } = render(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={0} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('slider', { name: /scrub to page/i })).toHaveValue('0')
    rerender(
      <ThumbnailScrubber pages={buildPages(8)} pageIndex={6} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('slider', { name: /scrub to page/i })).toHaveValue('6')
  })
})
