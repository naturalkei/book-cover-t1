import { ArrowLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import NotFound from '@/components/NotFound'
import PageFlip from '@/components/reader/PageFlip'
import PageJumpInput from '@/components/reader/PageJumpInput'
import ReaderControls from '@/components/reader/ReaderControls'
import ThumbnailScrubber from '@/components/reader/ThumbnailScrubber'
import { getBookById } from '@/data/books'
import { useReaderKeyboard } from '@/hooks/useReaderKeyboard'

export default function Reader() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const book = id ? getBookById(id) : undefined

  const [pageIndex, setPageIndex] = useState(0)
  const exitToGallery = useCallback(() => navigate('/'), [navigate])

  useReaderKeyboard({
    pageIndex,
    totalPages: book?.pages.length ?? 0,
    onPageChange: setPageIndex,
    onExit: exitToGallery,
  })

  if (!book) {
    return (
      <NotFound
        title="Book not found"
        message="We couldn’t find a book with that id. It may have been removed or never existed."
      />
    )
  }

  const totalPages = book.pages.length

  return (
    <section
      aria-label={`Reader for ${book.title}`}
      className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12"
    >
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-slate-300 dark:hover:text-white dark:focus-visible:ring-sky-400 dark:focus-visible:ring-offset-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to gallery
        </Link>

        <div className="text-right">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{book.title}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">by {book.author}</p>
        </div>
      </header>

      <PageFlip
        pages={book.pages}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        ariaLabel={`${book.title} spread`}
      />

      <ReaderControls
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPageChange={setPageIndex}
      />

      <div className="mt-4 flex justify-center">
        <PageJumpInput
          pageIndex={pageIndex}
          totalPages={totalPages}
          onPageChange={setPageIndex}
        />
      </div>

      <ThumbnailScrubber
        pages={book.pages}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
      />

      <footer className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
        tap a page side, use the controls, scrub, or jump to any page
      </footer>
    </section>
  )
}
