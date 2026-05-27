import clsx from 'clsx'
import { FlaskConical, Github } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function V2Layout() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL

  return (
    <div className={clsx(
      'flex min-h-dvh flex-col',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    )}
    >
      <nav aria-label="v2 primary" className="border-b border-slate-200 dark:border-slate-800">
        <div className={clsx(
          'mx-auto flex h-16 max-w-6xl items-center',
          'justify-between px-6',
        )}
        >
          <Link
            to="/v2"
            className={clsx(
              'flex items-center gap-3 text-sm font-semibold',
              'text-slate-900 dark:text-white',
            )}
          >
            <span className={clsx(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'bg-violet-600 text-white',
            )}
            >
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
            </span>
            book-flip-showcase v2
          </Link>

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
