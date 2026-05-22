import { Link } from 'react-router-dom'

import type { Book } from '@/data/books'

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const accent = book.accentColor ?? '#94a3b8'
  return (
    <Link
      to={`/book/${book.id}`}
      aria-label={`Open ${book.title} by ${book.author}`}
      className="group block rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:bg-slate-900/40 dark:ring-white/5 dark:hover:ring-white/15 dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
      style={{ boxShadow: `0 30px 60px -30px ${accent}33` }}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-200 shadow-xl dark:bg-slate-800">
        <img
          src={book.coverSrc}
          alt={`${book.title} cover`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-linear-to-r from-black/40 to-transparent"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{book.title}</h3>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
        </div>
        <span
          className="mt-1 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ color: accent, backgroundColor: `${accent}1a` }}
        >
          {book.pages.length} pages
        </span>
      </div>
    </Link>
  )
}
