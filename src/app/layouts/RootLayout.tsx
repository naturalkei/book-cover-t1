import clsx from 'clsx'
import { Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div className={clsx(
      'flex min-h-dvh flex-col',
      'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    )}
    >
      <Outlet />
    </div>
  )
}
