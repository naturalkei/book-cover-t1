import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Reader from './Reader'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/v2/book/:id" element={<Reader />} />
        <Route path="*" element={<Reader />} />
      </Routes>
    </MemoryRouter>,
  )

describe('Reader', () => {
  it('renders the book title and author for a known id', () => {
    renderAt('/v2/book/atlas-of-cities')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/atlas of cities/i)
    expect(screen.getByText(/by mara lin/i)).toBeInTheDocument()
  })

  it('shows page 1 of total pages by default', () => {
    renderAt('/v2/book/atlas-of-cities')
    const nav = screen.getByRole('navigation', { name: /reader pagination/i })
    expect(nav.textContent?.replace(/\s+/g, '')).toMatch(/1\/\d{2,}/)
  })

  it('renders the first page image with descriptive alt text', () => {
    renderAt('/v2/book/atlas-of-cities')
    expect(screen.getByAltText(/page 1/i)).toBeInTheDocument()
  })

  it('links back to the gallery', () => {
    renderAt('/v2/book/atlas-of-cities')
    const back = screen.getByRole('link', { name: /back to gallery/i })
    expect(back).toHaveAttribute('href', '/v2')
  })

  it('renders a not-found state for an unknown id', () => {
    renderAt('/v2/book/does-not-exist')
    expect(screen.getByRole('alert')).toHaveTextContent(/book not found/i)
  })
})
