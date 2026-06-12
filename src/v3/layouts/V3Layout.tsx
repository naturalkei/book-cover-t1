import clsx from 'clsx'
import { CirclePause, Layers, Github } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function V3Layout() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL

  return (
    <div className={clsx(
      'flex min-h-dvh flex-col',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    )}
    >
      <nav aria-label="v3 primary" className="border-b border-slate-200 dark:border-slate-800">
        <div className={clsx(
          'mx-auto flex min-h-16 max-w-6xl flex-wrap items-center',
          'justify-between gap-3 px-6 py-3',
        )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/v3"
              className={clsx(
                'flex items-center gap-3 text-sm font-semibold',
                'text-slate-900 dark:text-white',
              )}
            >
              <span className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-emerald-600 text-white',
              )}
              >
                <Layers className="h-4 w-4" aria-hidden="true" />
              </span>
              book-flip-showcase v3
            </Link>
            <span
              role="status"
              aria-label="v3 status: work in progress, development paused"
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
                'border-amber-300 bg-amber-50 text-xs font-semibold text-amber-900',
                'dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
              )}
            >
              <CirclePause className="h-3.5 w-3.5" aria-hidden="true" />
              Work in progress · Paused
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Version hub
            </Link>
            {githubUrl
              ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View source on GitHub"
                  className={clsx(
                    'inline-flex items-center gap-2 text-slate-600',
                    'hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                  )}
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  Source
                </a>
              )
              : null}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
