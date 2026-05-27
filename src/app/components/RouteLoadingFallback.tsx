import clsx from 'clsx'

export default function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="reader-loading"
      className={clsx(
        'mx-auto flex max-w-5xl items-center justify-center',
        'px-6 py-24 text-sm text-slate-700 dark:text-slate-300',
      )}
    >
      Loading reader…
    </div>
  )
}
