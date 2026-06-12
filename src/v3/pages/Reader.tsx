import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import NotFound from '@v3/components/NotFound'
import { getBookById } from '@v3/data/books'
import { TextLink } from '@v3/lib/class-names'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const book = id ? getBookById(id) : undefined

  if (!book) {
    return <NotFound title="Book not found" message="No v3 book matches this id." />
  }

  return (
    <section
      aria-label={`Reader for ${book.title}`}
      className="mx-auto w-full max-w-4xl px-6 py-12"
    >
      <Link to="/v3" className={TextLink}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to gallery
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{book.title}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">by {book.author}</p>
      </header>

      <div
        data-testid="v3-reader-stub"
        className={clsx(
          'mt-10 flex min-h-[420px] items-center justify-center',
          'rounded-2xl border border-dashed border-emerald-300/60',
          'bg-emerald-50/40 text-center dark:border-emerald-500/30',
          'dark:bg-emerald-950/20',
        )}
      >
        <div className="max-w-md px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            v3 flip engine
          </p>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            Progress-based curl renderer ships in the next milestone (#83).
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {book.pages.length} pages loaded · shared curl model ready
          </p>
        </div>
      </div>
    </section>
  )
}
