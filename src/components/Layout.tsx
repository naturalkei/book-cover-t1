import { BookOpen, Github } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-white">book-flip-showcase</span>
          </Link>

          {githubUrl
            ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="View source on GitHub"
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                <span>Source</span>
              </a>
            )
            : null}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>Built with React, Vite, and Tailwind. © {new Date().getFullYear()} book-flip-showcase.</p>
      </footer>
    </div>
  )
}
