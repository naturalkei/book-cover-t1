import clsx from 'clsx'
import { BookOpen, FlaskConical, Github } from 'lucide-react'
import { Link } from 'react-router-dom'

const cardClass = clsx(
  'group flex flex-col rounded-2xl border border-slate-200',
  'bg-white p-8 shadow-sm transition hover:border-slate-300',
  'hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
  'dark:hover:border-slate-700',
)

export default function VersionHub() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL

  return (
    <>
      <a
        href="#main-content"
        className={clsx(
          'sr-only focus:not-sr-only focus:absolute focus:z-50',
          'focus:m-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2',
          'focus:text-slate-900 focus:shadow-lg',
        )}
      >
        Skip to main content
      </a>
      <section
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-4xl flex-col px-6 py-16 sm:py-24"
      >
        <header className="mb-12 max-w-2xl">
          <p className={clsx(
            'text-xs font-medium uppercase tracking-[0.3em]',
            'text-slate-700 dark:text-slate-400',
          )}
          >
            book flip showcase
          </p>
          <h1 className={clsx(
            'mt-3 text-4xl font-bold tracking-tight text-slate-900',
            'sm:text-5xl dark:text-white',
          )}
          >
            Choose a version
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Compare the stable v1 demo with the v2 preview under active development.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link to="/v1" className={cardClass}>
            <span className={clsx(
              'mb-4 flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-slate-900 text-white dark:bg-white dark:text-slate-950',
            )}
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">v1</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
              Stable demo — page-flip MVP with gallery, reader presets, and keyboard navigation.
            </p>
            <span className="mt-6 text-sm font-medium text-slate-900 dark:text-white">
              Open v1 gallery →
            </span>
          </Link>

          <Link to="/v2" className={cardClass}>
            <span className={clsx(
              'mb-4 flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-violet-600 text-white',
            )}
            >
              <FlaskConical className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">v2</h2>
            <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
              Preview — active development. Features and layout may change without notice.
            </p>
            <span className="mt-6 text-sm font-medium text-slate-900 dark:text-white">
              Open v2 preview →
            </span>
          </Link>
        </div>

        {githubUrl
          ? (
            <footer className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className={clsx(
                  'inline-flex items-center gap-2 text-sm',
                  'text-slate-600 hover:text-slate-900',
                  'dark:text-slate-400 dark:hover:text-white',
                )}
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View source on GitHub
              </a>
            </footer>
          )
          : null}
      </section>
    </>
  )
}
