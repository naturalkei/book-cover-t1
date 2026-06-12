import { describe, expect, test, vi } from 'vitest'

import { createFlipProgressController, formatFlipProgress } from './flip-progress'

describe('flip-progress', () => {
  test('animates from 0 to 1 and commits', () => {
    const frames: number[] = []
    const onCommit = vi.fn()
    let time = 0

    const controller = createFlipProgressController({
      durationMs: 400,
      requestFrame: (cb) => {
        time += 100
        cb(time)
        return time
      },
      cancelFrame: () => {},
    })

    controller.start({
      onProgress: (value) => frames.push(value),
      onCommit,
    })

    expect(frames.length).toBeGreaterThan(0)
    expect(frames[frames.length - 1]).toBe(1)
    expect(onCommit).toHaveBeenCalledOnce()
    expect(controller.getState()).toBe('idle')
  })

  test('formats progress to three decimal places', () => {
    expect(formatFlipProgress(0.5)).toBe('0.500')
    expect(formatFlipProgress(1.2)).toBe('1.000')
  })
})
