import { describe, expect, it } from 'vitest'

import { books, getBookById } from './books'

describe('books data module', () => {
  it('exposes at least three sample books', () => {
    expect(books.length).toBeGreaterThanOrEqual(3)
  })

  it('gives every book a unique id', () => {
    const ids = books.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('requires every book to have at least 20 pages', () => {
    for (const book of books) {
      expect(book.pages.length).toBeGreaterThanOrEqual(20)
    }
  })

  it('exposes a unique page source for every page within a book', () => {
    for (const book of books) {
      const unique = new Set(book.pages)
      expect(unique.size).toBe(book.pages.length)
    }
  })

  it('references the cover under /books/ and serves pages as inline SVG data URIs', () => {
    for (const book of books) {
      expect(book.coverSrc).toMatch(/\/books\/[^/]+\.svg$/)
      for (const page of book.pages) {
        expect(page).toMatch(/^data:image\/svg\+xml/)
      }
    }
  })

  describe('getBookById', () => {
    it('returns the matching book for a known id', () => {
      const book = getBookById('atlas-of-cities')
      expect(book?.title).toBe('Atlas of Cities')
    })

    it('returns undefined for an unknown id', () => {
      expect(getBookById('does-not-exist')).toBeUndefined()
    })

    it('is case sensitive', () => {
      expect(getBookById('ATLAS-OF-CITIES')).toBeUndefined()
    })
  })
})
