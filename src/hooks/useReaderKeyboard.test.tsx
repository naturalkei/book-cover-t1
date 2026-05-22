import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useReaderKeyboard } from './useReaderKeyboard'

interface HarnessProps {
  pageIndex: number
  totalPages: number
  onPageChange: (next: number) => void
  onExit?: () => void
}

function Harness({ pageIndex, totalPages, onPageChange, onExit }: HarnessProps) {
  useReaderKeyboard({ pageIndex, totalPages, onPageChange, onExit })
  return (
    <div>
      <input data-testid="text-input" />
      <textarea data-testid="text-area" />
      <div data-testid="editable" contentEditable suppressContentEditableWarning>
        editable
      </div>
    </div>
  )
}

describe('useReaderKeyboard', () => {
  it('calls onPageChange(prev) on ArrowLeft', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange(next) on ArrowRight', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('jumps to the first page on Home', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={4} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'Home' })
    expect(onPageChange).toHaveBeenCalledWith(0)
  })

  it('jumps to the last page on End', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={0} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'End' })
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('invokes onExit on Escape', () => {
    const onExit = vi.fn()
    render(<Harness pageIndex={0} totalPages={6} onPageChange={() => {}} onExit={onExit} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onExit).toHaveBeenCalled()
  })

  it('respects boundaries — ArrowLeft at first page is a no-op', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={0} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('respects boundaries — ArrowRight at last page is a no-op', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={5} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores key events when an input is focused', () => {
    const onPageChange = vi.fn()
    const { getByTestId } = render(
      <Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />,
    )
    const input = getByTestId('text-input') as HTMLInputElement
    input.focus()
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores key events when a textarea is focused', () => {
    const onPageChange = vi.fn()
    const { getByTestId } = render(
      <Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />,
    )
    const ta = getByTestId('text-area') as HTMLTextAreaElement
    ta.focus()
    fireEvent.keyDown(ta, { key: 'ArrowRight' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores key events when a contenteditable is focused', () => {
    const onPageChange = vi.fn()
    const { getByTestId } = render(
      <Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />,
    )
    const editable = getByTestId('editable') as HTMLElement
    editable.focus()
    fireEvent.keyDown(editable, { key: 'ArrowRight' })
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('ignores shortcuts with modifier keys', () => {
    const onPageChange = vi.fn()
    render(<Harness pageIndex={2} totalPages={6} onPageChange={onPageChange} />)
    fireEvent.keyDown(document, { key: 'ArrowRight', metaKey: true })
    fireEvent.keyDown(document, { key: 'ArrowRight', ctrlKey: true })
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
