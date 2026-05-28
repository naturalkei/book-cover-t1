import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import CoverModeToggle from './CoverModeToggle'

describe('CoverModeToggle', () => {
  it('is checked when coverMode is single', () => {
    render(<CoverModeToggle coverMode="single" onChange={() => {}} />)
    const input = screen.getByRole('switch')
    expect(input).toBeChecked()
  })

  it('is unchecked when coverMode is spread', () => {
    render(<CoverModeToggle coverMode="spread" onChange={() => {}} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange with the new value when toggled', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<CoverModeToggle coverMode="spread" onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith('single')
  })

  it('respects the disabled flag', () => {
    render(<CoverModeToggle coverMode="single" onChange={() => {}} disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
