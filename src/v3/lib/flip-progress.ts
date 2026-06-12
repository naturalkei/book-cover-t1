import { clampUnit, easePaperProgress } from './curl-model'

export type TFlipProgressState = 'idle' | 'settling'

interface IFlipProgressRun {
  onProgress: (progress: number) => void
  onCommit: () => void
}

interface IFlipProgressControllerOptions {
  durationMs?: number
  requestFrame?: (callback: FrameRequestCallback) => number
  cancelFrame?: (handle: number) => void
}

export interface IFlipProgressController {
  getProgress: () => number
  getState: () => TFlipProgressState
  start: (run: IFlipProgressRun, reducedMotion?: boolean) => boolean
  cancel: () => void
}

export const createFlipProgressController = ({
  durationMs = 700,
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
}: IFlipProgressControllerOptions = {}): IFlipProgressController => {
  let state: TFlipProgressState = 'idle'
  let progress = 0
  let frameHandle: number | null = null
  let startTime: number | null = null

  const reset = () => {
    state = 'idle'
    progress = 0
    startTime = null
    frameHandle = null
  }

  const cancel = () => {
    if (frameHandle !== null) cancelFrame(frameHandle)
    reset()
  }

  const start = (run: IFlipProgressRun, reducedMotion = false): boolean => {
    if (state !== 'idle') return false

    state = 'settling'
    progress = 0
    run.onProgress(0)

    if (reducedMotion || durationMs <= 0) {
      progress = 1
      run.onProgress(1)
      run.onCommit()
      reset()
      return true
    }

    const tick: FrameRequestCallback = (timestamp) => {
      startTime ??= timestamp
      const elapsed = timestamp - startTime
      progress = easePaperProgress(clampUnit(elapsed / durationMs))
      run.onProgress(progress)

      if (elapsed >= durationMs) {
        run.onCommit()
        reset()
        return
      }

      frameHandle = requestFrame(tick)
    }

    frameHandle = requestFrame(tick)
    return true
  }

  return {
    getProgress: () => progress,
    getState: () => state,
    start,
    cancel,
  }
}

export const FLIP_DURATION_MS = 700
export const FLIP_DRAG_COMMIT_THRESHOLD = 0.42

export const formatFlipProgress = (value: number): string =>
  clampUnit(value).toFixed(3)
