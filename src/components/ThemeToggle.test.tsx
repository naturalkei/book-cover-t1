import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import ThemeToggle from './ThemeToggle'

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('ThemeToggle', () => {
  it('starts in dark and switches to light on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch to light theme/i })
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(button)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.localStorage.getItem('book-flip-showcase:theme')).toBe('light')
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument()
  })

  it('toggles back to dark on a second click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    await user.click(button)
    await user.click(button)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem('book-flip-showcase:theme')).toBe('dark')
  })
})
