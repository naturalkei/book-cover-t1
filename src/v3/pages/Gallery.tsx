import clsx from 'clsx'
import { Link } from 'react-router-dom'

import BookCard from '@v3/components/gallery/BookCard'
import { Books } from '@v3/data/books'

export default function Gallery() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
      <header className="mb-12 max-w-3xl">
        <p className={clsx(
          'text-xs font-medium uppercase tracking-[0.3em]',
          'text-emerald-600 dark:text-emerald-400',
        )}
        >
          v3 preview
        </p>
        <h1 className={clsx(
          'mt-3 text-4xl font-bold tracking-tight text-slate-900',
          'sm:text-5xl dark:text-white',
        )}
        >
          Paper curl reading room
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
          Progress-driven page curl and gutter lighting. Compare with the
          {' '}
          <Link to="/v2" className="font-medium text-emerald-600 underline dark:text-emerald-400">
            v2 CSS reader
          </Link>
          .
        </p>
      </header>

      <ul
        aria-label="Book gallery"
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Books.map((book) => (
          <li key={book.id}>
            <BookCard book={book} />
          </li>
        ))}
      </ul>
    </section>
  )
}
