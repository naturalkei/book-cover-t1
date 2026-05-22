import { useEffect } from 'react'

interface UseReaderKeyboardOptions {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  onExit?: () => void
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
}: UseReaderKeyboardOptions): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTypingInForm(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      switch (event.key) {
        case 'ArrowLeft':
          if (pageIndex > 0) {
            event.preventDefault()
            onPageChange(pageIndex - 1)
          }
          break
        case 'ArrowRight':
          if (pageIndex < totalPages - 1) {
            event.preventDefault()
            onPageChange(pageIndex + 1)
          }
          break
        case 'Home':
          if (pageIndex !== 0) {
            event.preventDefault()
            onPageChange(0)
          }
          break
        case 'End':
          if (pageIndex !== totalPages - 1) {
            event.preventDefault()
            onPageChange(totalPages - 1)
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
  }, [pageIndex, totalPages, onPageChange, onExit])
}
