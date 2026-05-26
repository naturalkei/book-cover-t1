import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { IBook } from '@/data/books'

import Gallery from './Gallery'

const sampleBooks: IBook[] = [
  {
    id: 'a',
    title: 'Alpha',
    author: 'Author A',
    coverSrc: '/books/a.svg',
    pages: ['/books/page-blank.svg'],
  },
  {
    id: 'b',
    title: 'Beta',
    author: 'Author B',
    coverSrc: '/books/b.svg',
    pages: ['/books/page-blank.svg', '/books/page-blank.svg'],
  },
]

const renderGallery = (props?: { books?: IBook[] }) =>
  render(
    <MemoryRouter>
      <Gallery {...props} />
    </MemoryRouter>,
  )

describe('Gallery', () => {
  it('renders the page heading', () => {
    renderGallery({ books: sampleBooks })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/flip/i)
  })

  it('renders a card for each book in a list', () => {
    renderGallery({ books: sampleBooks })
    const list = screen.getByRole('list', { name: /book gallery/i })
    const cards = within(list).getAllByRole('link')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute('href', '/book/a')
    expect(cards[1]).toHaveAttribute('href', '/book/b')
  })

  it('renders the empty state when there are no books', () => {
    renderGallery({ books: [] })
    expect(screen.queryByRole('list', { name: /book gallery/i })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/no books on the shelf yet/i)
  })

  it('falls back to the real books module when no prop is provided', () => {
    renderGallery()
    const list = screen.getByRole('list', { name: /book gallery/i })
    expect(within(list).getAllByRole('link').length).toBeGreaterThanOrEqual(3)
  })
})
