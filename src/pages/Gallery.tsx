import BookCard from '@/components/gallery/BookCard'
import { books as defaultBooks, type Book } from '@/data/books'

interface GalleryProps {
  books?: Book[]
}

export default function Gallery({ books = defaultBooks }: GalleryProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
      <header className="mb-12 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
          book flip showcase
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">
          A reading room you can flip through.
        </h1>
        <p className="mt-5 text-lg text-slate-400">
          Pick a cover to step into a paper-feel page turn. Drag, swipe, or tap to navigate.
        </p>
      </header>

      {books.length === 0
        ? (
          <div
            role="status"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 text-center text-slate-400"
          >
            <p className="text-lg font-medium text-slate-300">No books on the shelf yet</p>
            <p className="mt-2 text-sm">Add a book to <code className="font-mono">src/data/books.ts</code> to populate the gallery.</p>
          </div>
        )
        : (
          <ul
            aria-label="Book gallery"
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {books.map((book) => (
              <li key={book.id}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        )}
    </section>
  )
}
