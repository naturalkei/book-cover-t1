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

  it('requires every book to have at least one page', () => {
    for (const book of books) {
      expect(book.pages.length).toBeGreaterThan(0)
    }
  })

  it('references cover and page assets under /books/', () => {
    for (const book of books) {
      expect(book.coverSrc.startsWith('/books/')).toBe(true)
      for (const page of book.pages) {
        expect(page.startsWith('/books/')).toBe(true)
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
