import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ReaderControls from './ReaderControls'

const setup = (overrides: Partial<{ pageIndex: number; totalPages: number }> = {}) => {
  const onPageChange = vi.fn()
  render(
    <ReaderControls
      pageIndex={overrides.pageIndex ?? 2}
      totalPages={overrides.totalPages ?? 6}
      onPageChange={onPageChange}
    />,
  )
  return { onPageChange }
}

describe('ReaderControls', () => {
  it('renders the current page and total', () => {
    setup({ pageIndex: 2, totalPages: 6 })
    const nav = screen.getByRole('navigation', { name: /reader pagination/i })
    expect(nav.textContent?.replace(/\s+/g, '')).toContain('3/6')
  })

  it('calls onPageChange(prev) when the prev button is clicked', async () => {
    const user = userEvent.setup()
    const { onPageChange } = setup({ pageIndex: 2, totalPages: 6 })
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange(next) when the next button is clicked', async () => {
    const user = userEvent.setup()
    const { onPageChange } = setup({ pageIndex: 2, totalPages: 6 })
    await user.click(screen.getByRole('button', { name: /next page/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables the prev button at the first page', () => {
    setup({ pageIndex: 0, totalPages: 6 })
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled()
  })

  it('disables the next button at the last page', () => {
    setup({ pageIndex: 5, totalPages: 6 })
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /previous page/i })).toBeEnabled()
  })

  it('does not invoke onPageChange when a disabled button is clicked', async () => {
    const user = userEvent.setup()
    const { onPageChange } = setup({ pageIndex: 0, totalPages: 6 })
    await user.click(screen.getByRole('button', { name: /previous page/i }))
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
