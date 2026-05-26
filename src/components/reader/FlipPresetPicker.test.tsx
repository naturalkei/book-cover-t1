import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import FlipPresetPicker from './FlipPresetPicker'
import { FLIP_PRESET_LIST } from './flip-presets'

describe('FlipPresetPicker', () => {
  it('renders one chip per registered preset', () => {
    render(<FlipPresetPicker value="classic" onChange={vi.fn()} />)
    for (const preset of FLIP_PRESET_LIST) {
      expect(screen.getByTestId(`flip-preset-${preset.id}`)).toBeInTheDocument()
    }
  })

  it('marks the active chip with aria-checked and a data-active flag', () => {
    render(<FlipPresetPicker value="curl" onChange={vi.fn()} />)
    expect(screen.getByTestId('flip-preset-curl')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('flip-preset-curl')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('flip-preset-classic')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the chosen preset id when a chip is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<FlipPresetPicker value="classic" onChange={onChange} />)
    await user.click(screen.getByTestId('flip-preset-tilt'))
    expect(onChange).toHaveBeenCalledWith('tilt')
  })

  it('highlights the effective preset distinct from the stored one', () => {
    render(
      <FlipPresetPicker
        value="tilt"
        effectiveValue="fade"
        locked
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('flip-preset-tilt')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('flip-preset-fade')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('flip-preset-locked')).toBeInTheDocument()
  })

  it('exposes a radiogroup role with an accessible label', () => {
    render(<FlipPresetPicker value="classic" onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup', { name: /flip animation preset/i })).toBeInTheDocument()
  })
})
