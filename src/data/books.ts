export interface Book {
  id: string
  title: string
  author: string
  coverSrc: string
  pages: string[]
  accentColor?: string
  description?: string
}

const BASE = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '')

const asset = (path: string): string => `${BASE}/${path.replace(/^\//, '')}`

const PAGE_PLACEHOLDER = asset('books/page-blank.svg')

const repeatPlaceholder = (count: number): string[] =>
  Array.from({ length: count }, () => PAGE_PLACEHOLDER)

export const books: Book[] = [
  {
    id: 'atlas-of-cities',
    title: 'Atlas of Cities',
    author: 'Mara Lin',
    coverSrc: asset('books/atlas-of-cities.svg'),
    pages: repeatPlaceholder(8),
    accentColor: '#38bdf8',
    description: 'A field guide to urban form across twenty metropolises.',
  },
  {
    id: 'silent-frequencies',
    title: 'Silent Frequencies',
    author: 'Reed Okafor',
    coverSrc: asset('books/silent-frequencies.svg'),
    pages: repeatPlaceholder(12),
    accentColor: '#fbbf24',
    description: 'Essays on listening, attention, and the spaces between sounds.',
  },
  {
    id: 'coastal-tales',
    title: 'Coastal Tales',
    author: 'Yuki Tanaka',
    coverSrc: asset('books/coastal-tales.svg'),
    pages: repeatPlaceholder(10),
    accentColor: '#2dd4bf',
    description: 'Short stories collected along the tide line of a quiet coast.',
  },
]

export const getBookById = (id: string): Book | undefined =>
  books.find((book) => book.id === id)
