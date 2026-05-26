import clsx from 'clsx'
import { Link } from 'react-router-dom'

import type { IBook } from '@/data/books'
import { CardLink, CoverImageFrame } from '@/lib/class-names'

interface IBookCardProps {
  book: IBook
}

export default function BookCard({ book }: IBookCardProps) {
  const accent = book.accentColor ?? '#94a3b8'
  return (
    <Link
      to={`/book/${book.id}`}
      aria-label={`Open ${book.title} by ${book.author}`}
      className={CardLink}
      style={{ boxShadow: `0 30px 60px -30px ${accent}33` }}
    >
      <div className={CoverImageFrame}>
        <img
          src={book.coverSrc}
          alt={`${book.title} cover`}
          loading="lazy"
          decoding="async"
          className={clsx(
            'h-full w-full object-cover transition duration-500',
            'group-hover:scale-[1.02]',
          )}
        />
        <span
          aria-hidden="true"
          className={clsx(
            'pointer-events-none absolute inset-y-0 left-0 w-3',
            'bg-linear-to-r from-black/40 to-transparent',
          )}
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={clsx(
            'truncate text-lg font-semibold',
            'text-slate-900 dark:text-white',
          )}
          >{book.title}</h3>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
        </div>
        <span className={clsx(
          'mt-1 inline-flex shrink-0 items-center rounded-full',
          'bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700',
          'dark:bg-white/10 dark:text-slate-200',
        )}
        >
          {book.pages.length} pages
        </span>
      </div>
    </Link>
  )
}
