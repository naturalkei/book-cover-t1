export type TFlipDirection = 'forward' | 'backward'

export interface ICurlModelConfig {
  maxRadius: number
  minRadius: number
  maxLift: number
  leadRadians: number
  leadExponent: number
}

export interface ICurlSample {
  progress: number
  easedProgress: number
  u: number
  angle: number
  radius: number
  lift: number
}

export interface IGutterLightingSample {
  progress: number
  creaseAo: number
  castOpacity: number
  castWidth: number
  ridgeLight: number
}

export const DEFAULT_CURL_MODEL_CONFIG: ICurlModelConfig = {
  maxRadius: 1.4,
  minRadius: 0.34,
  maxLift: 0.18,
  leadRadians: 0.42,
  leadExponent: 1.6,
}

export const CURL_PROGRESS_CHECKPOINTS = [0, 0.25, 0.5, 0.75, 1] as const

export const clampUnit = (value: number): number =>
  Math.min(1, Math.max(0, value))

export const easePaperProgress = (progress: number): number => {
  const p = clampUnit(progress)
  return p * p * (3 - 2 * p)
}

export const sampleCurl = (
  u: number,
  progress: number,
  direction: TFlipDirection,
  config: ICurlModelConfig = DEFAULT_CURL_MODEL_CONFIG,
): ICurlSample => {
  const safeU = clampUnit(u)
  const safeProgress = clampUnit(progress)
  const easedProgress = easePaperProgress(safeProgress)
  const midpointWeight = Math.sin(Math.PI * safeProgress)
  const directionSign = direction === 'forward' ? -1 : 1
  const lead = config.leadRadians
    * midpointWeight
    * Math.pow(safeU, config.leadExponent)

  return {
    progress: safeProgress,
    easedProgress,
    u: safeU,
    angle: directionSign * (Math.PI * easedProgress + lead),
    radius: mix(config.maxRadius, config.minRadius, midpointWeight),
    lift: Math.sin(Math.PI * safeU) * midpointWeight * config.maxLift,
  }
}

export const sampleGutterLighting = (progress: number): IGutterLightingSample => {
  const safeProgress = clampUnit(progress)
  const midpointWeight = Math.sin(Math.PI * safeProgress)

  return {
    progress: safeProgress,
    creaseAo: 0.25 + 0.2 * midpointWeight,
    castOpacity: 0.48 * Math.pow(midpointWeight, 0.7),
    castWidth: mix(0.12, 1, midpointWeight),
    ridgeLight: 0.22 * midpointWeight,
  }
}

const mix = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount
