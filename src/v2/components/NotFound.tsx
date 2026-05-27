import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section
      role="alert"
      className="mx-auto max-w-md px-6 py-32 text-center"
    >
      <p className={clsx(
        'text-sm font-medium uppercase tracking-[0.3em]',
        'text-slate-500 dark:text-slate-400',
      )}
      >
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">
        This v2 page does not exist.
      </p>
      <Link
        to="/v2"
        className={clsx(
          'mt-8 inline-flex rounded-full border border-slate-300',
          'px-5 py-2 text-sm font-medium text-slate-900',
          'hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900',
        )}
      >
        Back to v2 preview
      </Link>
    </section>
  )
}
