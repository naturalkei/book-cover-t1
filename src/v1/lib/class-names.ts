import clsx from 'clsx'

/** Max characters per clsx line argument (see plan-1 / code-style). */
export const CLASS_LINE_LIMIT = 60

/** Shared focus-visible ring styles for interactive controls. */
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

export const FocusRingSkipLink = clsx(
  'sr-only focus:not-sr-only focus:fixed',
  'focus:left-4 focus:top-4 focus:z-[60]',
  'focus:rounded-full focus:bg-sky-500',
  'focus:px-4 focus:py-2 focus:text-sm focus:font-semibold',
  'focus:text-white focus:outline-none',
  'focus:ring-2 focus:ring-sky-300 focus:ring-offset-2',
  'focus:ring-offset-white',
  'dark:focus:ring-offset-slate-950',
)

export const PillButton = clsx(
  'inline-flex items-center gap-2 rounded-full',
  'bg-slate-200 px-4 py-2',
  'text-sm font-medium text-slate-700',
  'transition hover:bg-slate-300',
  FocusRing,
)

export const IconButton = clsx(
  'inline-flex h-9 w-9 items-center justify-center',
  'rounded-full bg-slate-200 text-slate-700',
  'transition hover:bg-slate-300',
  FocusRing,
  'dark:bg-white/5 dark:text-slate-200',
  'dark:hover:bg-white/10',
)

export const TextLink = clsx(
  'inline-flex items-center gap-2',
  'text-sm font-medium text-slate-600',
  'transition hover:text-slate-900',
  FocusRing,
  'dark:text-slate-300 dark:hover:text-white',
)

export const RangeInput = clsx(
  'w-full accent-sky-500',
  FocusRing,
  'dark:accent-sky-400',
)

export const NavLinkBrand = clsx(
  'flex items-center gap-2',
  'text-sm font-semibold tracking-tight',
  FocusRing,
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

export const ViewModeOption = clsx(
  'inline-flex items-center gap-1.5 rounded-full',
  'px-3 py-1.5 font-medium transition',
  FocusRing,
)

export const FlipPresetOption = clsx(
  'group flex min-w-[8rem] flex-col items-start',
  'gap-0.5 rounded-xl border px-3 py-2',
  'text-left transition',
  FocusRing,
)

export const ThumbnailButton = clsx(
  'block h-16 w-12 overflow-hidden rounded-md',
  'ring-1 transition',
  FocusRing,
)

export const AppShell = clsx(
  'flex min-h-screen flex-col',
  'bg-slate-50 font-sans text-slate-900',
  'dark:bg-slate-950 dark:text-slate-100',
)

export const LayoutNav = clsx(
  'sticky top-0 z-50 border-b',
  'border-slate-200/80 bg-white/70 backdrop-blur-md',
  'dark:border-white/5 dark:bg-slate-950/70',
)

export const LayoutFooter = clsx(
  'border-t border-slate-200/80 py-8',
  'text-center text-xs text-slate-600',
  'dark:border-white/5 dark:text-slate-400',
)

export const GalleryEmptyState = clsx(
  'flex min-h-[280px] flex-col items-center',
  'justify-center rounded-3xl border border-dashed',
  'border-slate-300 bg-white text-center text-slate-600',
  'dark:border-slate-700 dark:bg-slate-900/40',
  'dark:text-slate-400',
)

export const ToggleChipLabel = clsx(
  'inline-flex select-none items-center gap-2',
  'rounded-full bg-slate-200 px-3 py-1.5',
  'text-xs font-medium uppercase tracking-[0.15em]',
  'text-slate-700 ring-1 ring-slate-300',
  'dark:bg-white/5 dark:text-slate-200 dark:ring-white/5',
)

export const PageJumpForm = clsx(
  'inline-flex items-center gap-2 rounded-full',
  'bg-slate-200 px-3 py-1.5 text-sm text-slate-700',
  'ring-1 ring-slate-300',
  'dark:bg-white/5 dark:text-slate-200 dark:ring-white/5',
)

export const CoverImageFrame = clsx(
  'relative aspect-[2/3] overflow-hidden',
  'rounded-xl bg-slate-200 shadow-xl dark:bg-slate-800',
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

export const FlipPresetOptionActive = clsx(
  'border-sky-500 bg-sky-50 text-slate-900 shadow-sm',
  'dark:border-sky-400 dark:bg-sky-400/10 dark:text-white',
)

export const FlipPresetOptionIdle = clsx(
  'border-slate-200 bg-white text-slate-700',
  'hover:border-slate-300',
  'dark:border-white/10 dark:bg-slate-900/40',
  'dark:text-slate-200 dark:hover:border-white/20',
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

export const ThumbnailButtonActive = clsx(
  'ring-sky-500 shadow-[0_0_0_2px_rgba(56,189,248,0.4)]',
  'dark:ring-sky-400',
)

export const ThumbnailButtonIdle = clsx(
  'ring-slate-200 hover:ring-slate-300',
  'dark:ring-white/10 dark:hover:ring-white/30',
)
