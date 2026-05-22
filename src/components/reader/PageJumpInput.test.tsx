import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import PageJumpInput from './PageJumpInput'

const setup = (overrides: Partial<{ pageIndex: number; totalPages: number }> = {}) => {
  const onPageChange = vi.fn()
  const utils = render(
    <PageJumpInput
      pageIndex={overrides.pageIndex ?? 0}
      totalPages={overrides.totalPages ?? 10}
      onPageChange={onPageChange}
    />,
  )
  const input = screen.getByRole('spinbutton', { name: /page number/i })
  return { onPageChange, input, ...utils }
}

describe('PageJumpInput', () => {
  it('shows the 1-based current page as the input value', () => {
    const { input } = setup({ pageIndex: 4, totalPages: 10 })
    expect(input).toHaveValue(5)
  })

  it('jumps to the entered page on submit (Enter)', async () => {
    const user = userEvent.setup()
    const { input, onPageChange } = setup({ pageIndex: 0, totalPages: 10 })
    await user.clear(input)
    await user.type(input, '7{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('clamps values above the total to the last page', async () => {
    const user = userEvent.setup()
    const { input, onPageChange } = setup({ pageIndex: 0, totalPages: 10 })
    await user.clear(input)
    await user.type(input, '99{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(9)
    expect(input).toHaveValue(10)
  })

  it('clamps values below 1 to the first page', async () => {
    const user = userEvent.setup()
    const { input, onPageChange } = setup({ pageIndex: 5, totalPages: 10 })
    await user.clear(input)
    await user.type(input, '0{Enter}')
    expect(onPageChange).toHaveBeenCalledWith(0)
    expect(input).toHaveValue(1)
  })

  it('reverts non-numeric input on submit without calling onPageChange', async () => {
    const user = userEvent.setup()
    const { input, onPageChange } = setup({ pageIndex: 4, totalPages: 10 })
    await user.clear(input)
    await user.type(input, '{Enter}')
    expect(onPageChange).not.toHaveBeenCalled()
    expect(input).toHaveValue(5)
  })

  it('does not call onPageChange when the user enters the current page', async () => {
    const user = userEvent.setup()
    const { input, onPageChange } = setup({ pageIndex: 3, totalPages: 10 })
    await user.clear(input)
    await user.type(input, '4{Enter}')
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('updates the input when pageIndex changes externally', () => {
    const { input, rerender } = setup({ pageIndex: 0, totalPages: 10 })
    expect(input).toHaveValue(1)
    rerender(
      <PageJumpInput pageIndex={6} totalPages={10} onPageChange={() => {}} />,
    )
    expect(screen.getByRole('spinbutton', { name: /page number/i })).toHaveValue(7)
  })
})
