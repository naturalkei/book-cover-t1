import { Link } from 'react-router-dom'

interface NotFoundProps {
  title?: string
  message?: string
}

export default function NotFound({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
}: NotFoundProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-md px-6 py-32 text-center"
    >
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-400">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Back to gallery
      </Link>
    </section>
  )
}
