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

export const BasePaginationButton = clsx(
  'inline-flex items-center gap-1.5 rounded-full',
  'bg-slate-200 px-4 py-2',
  'text-sm font-medium text-slate-700',
  'transition hover:bg-slate-300',
  'disabled:cursor-not-allowed disabled:opacity-40',
  'disabled:hover:bg-slate-200',
  FocusRingOnSlate50,
  'dark:bg-white/5 dark:text-slate-200',
  'dark:hover:bg-white/10',
  'dark:disabled:hover:bg-white/5',
)

export const PageFlipSurface = clsx(
  'relative mx-auto w-full select-none bg-slate-200',
  'shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)]',
  'ring-1 ring-slate-200',
  'dark:bg-slate-900',
  'dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]',
  'dark:ring-white/5',
  FocusRingOnSlate50,
)

export const ViewModeOption = clsx(
  'inline-flex items-center gap-1.5 rounded-full',
  'px-3 py-1.5 font-medium transition',
  FocusRing,
)

export const ViewModeOptionActive = clsx(
  'bg-white text-slate-900 shadow-sm',
  'ring-1 ring-slate-300',
  'dark:bg-slate-900 dark:text-white dark:ring-white/10',
)

export const ViewModeOptionIdle = clsx(
  'text-slate-700 hover:text-slate-900',
  'dark:text-slate-300 dark:hover:text-white',
)
