import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { IBook } from '@v2/data/books'

import BookCard from './BookCard'

const COVER_SRC = '/books/atlas-of-cities.svg'

const book: IBook = {
  id: 'atlas-of-cities',
  title: 'Atlas of Cities',
  author: 'Mara Lin',
  coverSrc: COVER_SRC,
  pages: ['/books/page-blank.svg', '/books/page-blank.svg'],
  accentColor: '#38bdf8',
}

const renderCard = () =>
  render(
    <MemoryRouter>
      <BookCard book={book} />
    </MemoryRouter>,
  )

describe('BookCard', () => {
  it('renders the title, author, and page count', () => {
    renderCard()
    expect(screen.getByText('Atlas of Cities')).toBeInTheDocument()
    expect(screen.getByText('Mara Lin')).toBeInTheDocument()
    expect(screen.getByText(/2 pages/i)).toBeInTheDocument()
  })

  it('links to the reader route for the book', () => {
    renderCard()
    const link = screen.getByRole('link', { name: /open atlas of cities/i })
    expect(link).toHaveAttribute('href', '/v2/book/atlas-of-cities')
  })

  it('uses the cover image with descriptive alt text', () => {
    renderCard()
    const img = screen.getByAltText(/atlas of cities cover/i)
    expect(img).toHaveAttribute('src', COVER_SRC)
  })
})
