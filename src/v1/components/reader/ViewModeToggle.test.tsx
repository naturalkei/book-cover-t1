import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ViewModeToggle from './ViewModeToggle'

describe('ViewModeToggle', () => {
  it('renders single and spread options with active state on current mode', () => {
    render(<ViewModeToggle mode="single" onChange={vi.fn()} />)
    const single = screen.getByTestId('view-mode-single')
    const spread = screen.getByTestId('view-mode-spread')
    expect(single).toHaveAttribute('aria-checked', 'true')
    expect(spread).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the chosen mode when a chip is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ViewModeToggle mode="single" onChange={onChange} />)
    await user.click(screen.getByTestId('view-mode-spread'))
    expect(onChange).toHaveBeenCalledWith('spread')
  })

  it('exposes a radiogroup role and accessible labels per chip', () => {
    render(<ViewModeToggle mode="spread" onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup', { name: /view mode/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /single view/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /spread view/i })).toBeInTheDocument()
  })
})
