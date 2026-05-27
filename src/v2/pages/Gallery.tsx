import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function Gallery() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16 sm:py-24">
      <header className="max-w-2xl">
        <p className={clsx(
          'text-xs font-medium uppercase tracking-[0.3em]',
          'text-violet-600 dark:text-violet-400',
        )}
        >
          v2 preview
        </p>
        <h1 className={clsx(
          'mt-3 text-4xl font-bold tracking-tight text-slate-900',
          'sm:text-5xl dark:text-white',
        )}
        >
          Next-generation reading room
        </h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
          v2 is under active development. The gallery and reader will evolve independently from v1.
        </p>
      </header>

      <div className={clsx(
        'mt-12 rounded-2xl border border-dashed border-slate-300',
        'bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900',
      )}
      >
        <p className="text-slate-700 dark:text-slate-300">Gallery content coming soon.</p>
        <Link
          to="/v1"
          className={clsx(
            'mt-6 inline-flex rounded-full border border-slate-300',
            'px-5 py-2 text-sm font-medium text-slate-900',
            'hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800',
          )}
        >
          Browse the stable v1 demo
        </Link>
      </div>
    </section>
  )
}
