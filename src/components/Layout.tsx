import { Github } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL
  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      {/* Sticky Glassmorphism Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">V</div>
            <span>VRT Starter</span>
          </Link>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium transition hover:bg-slate-200"
          >
            <Github size={18} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-slate-500">
        <p>©2026 naturalkei. MIT License.</p>
      </footer>
    </div>
  )
}
