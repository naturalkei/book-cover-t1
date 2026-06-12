import clsx from 'clsx'

export const FocusRing = clsx(
  'focus-visible:outline-none',
  'focus-visible:ring-2 focus-visible:ring-sky-500',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-white',
  'dark:focus-visible:ring-sky-400',
  'dark:focus-visible:ring-offset-slate-950',
)

export const FocusRingOnSlate50 = clsx(
  FocusRing,
  'focus-visible:ring-offset-slate-50',
)

export const CardLink = clsx(
  'group block rounded-2xl bg-white p-4',
  'ring-1 ring-slate-200 transition',
  'hover:-translate-y-1 hover:ring-slate-300',
  FocusRingOnSlate50,
  'dark:bg-slate-900/40 dark:ring-white/5',
  'dark:hover:ring-white/15',
)

export const GalleryBackLink = clsx(
  'mt-8 inline-flex items-center gap-2 rounded-full',
  'bg-slate-200 px-5 py-2.5',
  'text-sm font-medium text-slate-700',
  'transition hover:bg-slate-300',
  FocusRing,
  'dark:bg-white/5 dark:text-slate-200',
  'dark:hover:bg-white/10',
)

export const CoverImageFrame = clsx(
  'relative aspect-[2/3] overflow-hidden',
  'rounded-xl bg-slate-200 shadow-xl dark:bg-slate-800',
)

export const TextLink = clsx(
  'inline-flex items-center gap-2',
  'text-sm font-medium text-slate-600',
  'transition hover:text-slate-900',
  FocusRing,
  'dark:text-slate-300 dark:hover:text-white',
)
