import { Link } from 'react-router-dom'

import { GalleryBackLink } from '@/lib/class-names'

interface INotFoundProps {
  title?: string
  message?: string
}

export default function NotFound({
  title = 'Page not found',
  message = 'The page you are looking for does not exist.',
}: INotFoundProps) {
  return (
    <section
      role="alert"
      className="mx-auto max-w-md px-6 py-32 text-center"
    >
      <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">404</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{message}</p>
      <Link to="/" className={GalleryBackLink}>
        Back to gallery
      </Link>
    </section>
  )
}
