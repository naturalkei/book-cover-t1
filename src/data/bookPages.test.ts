import { describe, expect, it } from 'vitest'

import { createBookPages } from './bookPages'

const decode = (uri: string): string => {
  const prefix = 'data:image/svg+xml;charset=utf-8,'
  expect(uri.startsWith(prefix)).toBe(true)
  return decodeURIComponent(uri.slice(prefix.length))
}

describe('createBookPages', () => {
  it('produces exactly the requested number of pages', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'Sample', author: 'Author', accentColor: '#38bdf8', count: 24,
    })
    expect(pages).toHaveLength(24)
  })

  it('returns a unique source for every page', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'Sample', author: 'Author', accentColor: '#38bdf8', count: 24,
    })
    expect(new Set(pages).size).toBe(pages.length)
  })

  it('encodes each page as an SVG data URI', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'Sample', author: 'Author', accentColor: '#38bdf8', count: 20,
    })
    for (const page of pages) {
      expect(page).toMatch(/^data:image\/svg\+xml/)
    }
  })

  it('renders the book title and author into the cover (first) page', () => {
    const [first] = createBookPages({
      bookId: 'sample', title: 'My Title', author: 'The Author', accentColor: '#38bdf8', count: 20,
    })
    const svg = decode(first)
    expect(svg).toContain('My Title')
    expect(svg).toContain('THE AUTHOR')
  })

  it('renders the page number on every page', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'My Title', author: 'The Author', accentColor: '#38bdf8', count: 22,
    })
    pages.forEach((uri, idx) => {
      const svg = decode(uri)
      expect(svg).toContain(`${idx + 1} / 22`)
    })
  })

  it('includes a colophon on the final page', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'My Title', author: 'The Author', accentColor: '#38bdf8', count: 20,
    })
    const last = decode(pages[pages.length - 1])
    expect(last.toLowerCase()).toContain('colophon')
  })

  it('emits at least one figure page between the cover and the colophon', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'My Title', author: 'The Author', accentColor: '#38bdf8', count: 22,
    })
    const figureCount = pages
      .slice(1, -1)
      .map(decode)
      .filter(svg => /FIGURE \d+/.test(svg)).length
    expect(figureCount).toBeGreaterThanOrEqual(1)
  })

  it('threads the accent colour into the header band of every page', () => {
    const pages = createBookPages({
      bookId: 'sample', title: 'My Title', author: 'The Author', accentColor: '#38bdf8', count: 20,
    })
    for (const uri of pages) {
      const svg = decode(uri)
      expect(svg.toLowerCase()).toContain('#38bdf8')
    }
  })

  it('handles XML-unsafe characters in the title without breaking the SVG', () => {
    const [first] = createBookPages({
      bookId: 'risky', title: 'A & B <C>', author: 'Quoted "Name"', accentColor: '#38bdf8', count: 20,
    })
    const svg = decode(first)
    expect(svg).toContain('A &amp; B &lt;C&gt;')
    expect(svg).toContain('QUOTED &quot;NAME&quot;')
  })
})
