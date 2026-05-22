import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import NotFound from '@/components/NotFound'
import { getBookById } from '@/data/books'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const book = id ? getBookById(id) : undefined

  if (!book) {
    return (
      <NotFound
        title="Book not found"
        message="We couldn’t find a book with that id. It may have been removed or never existed."
      />
    )
  }

  const totalPages = book.pages.length
  const currentPage = 0
  const currentSrc = book.pages[currentPage]

  return (
    <section
      aria-label={`Reader for ${book.title}`}
      className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12"
    >
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to gallery
        </Link>

        <div className="text-right">
          <h1 className="text-2xl font-semibold text-white">{book.title}</h1>
          <p className="text-sm text-slate-400">by {book.author}</p>
        </div>
      </header>

      <div
        aria-label="Book spread"
        className="relative mx-auto aspect-[3/4] w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
      >
        <img
          src={currentSrc}
          alt={`${book.title} page ${currentPage + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      <footer className="mt-8 flex items-center justify-between text-sm text-slate-400">
        <p>
          Page <span className="text-white">{currentPage + 1}</span>
          <span className="px-1 text-slate-600">/</span>
          <span>{totalPages}</span>
        </p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          flip controls land in M2 / M3
        </p>
      </footer>
    </section>
  )
}
