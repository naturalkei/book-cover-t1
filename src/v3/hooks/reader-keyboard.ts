import { useEffect } from 'react'

interface IUseReaderKeyboardOptions {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  onExit?: () => void
  step?: number
  snap?: (index: number) => number
}

const isTypingInForm = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  const ce = target.getAttribute('contenteditable')
  if (ce === '' || ce === 'true' || ce === 'plaintext-only') return true
  return false
}

export function useReaderKeyboard({
  pageIndex,
  totalPages,
  onPageChange,
  onExit,
  step = 1,
  snap,
}: IUseReaderKeyboardOptions): void {
  useEffect(() => {
    const safeStep = Math.max(1, Math.floor(step))
    const lastIndex = Math.max(0, totalPages - 1)
    const snapFn = snap ?? ((i: number) => Math.max(0, i - (i % safeStep)))
    const lastStart = snapFn(lastIndex)

    const handler = (event: KeyboardEvent) => {
      if (isTypingInForm(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      switch (event.key) {
        case 'ArrowLeft': {
          if (pageIndex <= 0) return
          const target = snapFn(Math.max(0, pageIndex - safeStep))
          if (target !== pageIndex) {
            event.preventDefault()
            onPageChange(target)
          }
          break
        }
        case 'ArrowRight': {
          if (pageIndex >= lastIndex) return
          const candidate = Math.min(pageIndex + safeStep, lastIndex)
          const target = snapFn(candidate)
          if (target !== pageIndex) {
            event.preventDefault()
            onPageChange(target)
          }
          break
        }
        case 'Home':
          if (pageIndex !== 0) {
            event.preventDefault()
            onPageChange(0)
          }
          break
        case 'End':
          if (pageIndex !== lastStart) {
            event.preventDefault()
            onPageChange(lastStart)
          }
          break
        case 'Escape':
          if (onExit) {
            event.preventDefault()
            onExit()
          }
          break
        default:
          break
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pageIndex, totalPages, onPageChange, onExit, step, snap])
}
