import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import RoundedToggle from './RoundedToggle'

describe('RoundedToggle', () => {
  it('is unchecked when rounded is false (default)', () => {
    render(<RoundedToggle rounded={false} onChange={() => {}} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('is checked when rounded is true', () => {
    render(<RoundedToggle rounded onChange={() => {}} />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('calls onChange with the new value when toggled', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<RoundedToggle rounded={false} onChange={onChange} />)
    await user.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
