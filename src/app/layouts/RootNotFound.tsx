import clsx from 'clsx'
import { Link } from 'react-router-dom'

export default function RootNotFound() {
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
        The page you are looking for does not exist.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/"
          className={clsx(
            'rounded-full border border-slate-300 px-5 py-2 text-sm',
            'font-medium text-slate-900 hover:bg-slate-100',
            'dark:border-slate-700 dark:text-white dark:hover:bg-slate-900',
          )}
        >
          Version hub
        </Link>
        <Link
          to="/v1"
          className={clsx(
            'rounded-full border border-slate-300 px-5 py-2 text-sm',
            'font-medium text-slate-900 hover:bg-slate-100',
            'dark:border-slate-700 dark:text-white dark:hover:bg-slate-900',
          )}
        >
          v1 gallery
        </Link>
        <Link
          to="/v2"
          className={clsx(
            'rounded-full border border-slate-300 px-5 py-2 text-sm',
            'font-medium text-slate-900 hover:bg-slate-100',
            'dark:border-slate-700 dark:text-white dark:hover:bg-slate-900',
          )}
        >
          v2 preview
        </Link>
        <Link
          to="/v3"
          className={clsx(
            'rounded-full border border-slate-300 px-5 py-2 text-sm',
            'font-medium text-slate-900 hover:bg-slate-100',
            'dark:border-slate-700 dark:text-white dark:hover:bg-slate-900',
          )}
        >
          v3 preview
        </Link>
      </div>
    </section>
  )
}
