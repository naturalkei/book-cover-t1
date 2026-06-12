import clsx from 'clsx'
import { Link } from 'react-router-dom'

import { GalleryBackLink } from '@v3/lib/class-names'

interface INotFoundProps {
  title?: string
  message?: string
}

export default function NotFound({
  title = 'Page not found',
  message = 'This v3 page does not exist.',
}: INotFoundProps) {
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
      <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{message}</p>
      <Link to="/v3" className={GalleryBackLink}>
        Back to v3 gallery
      </Link>
    </section>
  )
}
