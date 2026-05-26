import { BookOpen, Github } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import ThemeToggle from '@/components/ThemeToggle'
import { FocusRingSkipLink, NavLinkBrand, PillButton } from '@/lib/class-names'

export default function Layout() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a href="#main-content" className={FocusRingSkipLink}>
        Skip to main content
      </a>
      <nav
        aria-label="Primary"
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/70"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className={NavLinkBrand}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-slate-900 dark:text-white">book-flip-showcase</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {githubUrl
              ? (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View source on GitHub"
                  className={PillButton}
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>Source</span>
                </a>
              )
              : null}
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 py-8 text-center text-xs text-slate-600 dark:border-white/5 dark:text-slate-400">
        <p>Built with React, Vite, and Tailwind. © {new Date().getFullYear()} book-flip-showcase.</p>
      </footer>
    </div>
  )
}
