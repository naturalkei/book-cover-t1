import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Reader from './Reader'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/book/:id" element={<Reader />} />
        <Route path="*" element={<Reader />} />
      </Routes>
    </MemoryRouter>,
  )

describe('Reader', () => {
  it('renders the book title and author for a known id', () => {
    renderAt('/book/atlas-of-cities')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/atlas of cities/i)
    expect(screen.getByText(/by mara lin/i)).toBeInTheDocument()
  })

  it('shows page 1 of total pages by default', () => {
    renderAt('/book/atlas-of-cities')
    const indicator = screen.getByText(/^page$/i, { selector: 'p, span' }).closest('p') as HTMLElement
    expect(indicator.textContent).toMatch(/page\s*1\s*\/\s*8/i)
  })

  it('renders the first page image with descriptive alt text', () => {
    renderAt('/book/atlas-of-cities')
    expect(screen.getByAltText(/page 1/i)).toBeInTheDocument()
  })

  it('links back to the gallery', () => {
    renderAt('/book/atlas-of-cities')
    const back = screen.getByRole('link', { name: /back to gallery/i })
    expect(back).toHaveAttribute('href', '/')
  })

  it('renders a not-found state for an unknown id', () => {
    renderAt('/book/does-not-exist')
    expect(screen.getByRole('alert')).toHaveTextContent(/book not found/i)
  })
})
