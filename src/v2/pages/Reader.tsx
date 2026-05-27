import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function Reader() {
  const { id } = useParams<{ id: string }>()

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <Link
        to="/v2"
        className={clsx(
          'inline-flex items-center gap-2 text-sm font-medium',
          'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to v2 preview
      </Link>

      <div
        role="status"
        className={clsx(
          'mt-12 rounded-2xl border border-dashed border-slate-300',
          'bg-white p-10 dark:border-slate-700 dark:bg-slate-900',
        )}
      >
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          v2 reader stub
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Book <code className="font-mono text-sm">{id}</code> will open here once the v2 reader engine ships.
        </p>
      </div>
    </section>
  )
}
