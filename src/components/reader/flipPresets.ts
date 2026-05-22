import type { CSSProperties } from 'react'

export type FlipDirection = 'forward' | 'backward'
export type FlipPresetId = 'classic' | 'curl' | 'slide' | 'fade' | 'tilt'

export interface FlipFrames {
  initial: CSSProperties
  final: CSSProperties
}

export interface FlipPreset {
  id: FlipPresetId
  label: string
  description: string
  build: (direction: FlipDirection, durationMs: number) => FlipFrames
}

const easeFlip = 'cubic-bezier(0.2, 0.7, 0.2, 1)'
const easeCurl = 'cubic-bezier(0.32, 0, 0.32, 1)'
const easeSlide = 'cubic-bezier(0.3, 0, 0.2, 1)'
const easeTilt = 'cubic-bezier(0.4, 0.05, 0.2, 1)'

const restingTransform = 'none'

const FLIP_PRESETS: FlipPreset[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Pure 3D rotateY page turn.',
    build: (direction, duration) => {
      const transformOrigin = direction === 'forward' ? 'left center' : 'right center'
      const transition = `transform ${duration}ms ${easeFlip}, opacity ${duration}ms ease-in-out`
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
          backfaceVisibility: 'hidden',
        },
        final: {
          transformOrigin,
          transition,
          transform: direction === 'forward' ? 'rotateY(-180deg)' : 'rotateY(180deg)',
          opacity: 0,
          boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
          backfaceVisibility: 'hidden',
        },
      }
    },
  },
  {
    id: 'curl',
    label: 'Curl',
    description: 'Soft paper curl with a lifted corner.',
    build: (direction, duration) => {
      const transformOrigin = direction === 'forward' ? 'left center' : 'right center'
      const transition = `transform ${duration}ms ${easeCurl}, opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
          backfaceVisibility: 'hidden',
        },
        final: {
          transformOrigin,
          transition,
          transform: direction === 'forward'
            ? 'perspective(1600px) rotateY(-160deg) translateX(-6%) skewY(-1deg)'
            : 'perspective(1600px) rotateY(160deg) translateX(6%) skewY(1deg)',
          opacity: 0,
          filter: 'drop-shadow(0 24px 24px rgba(0, 0, 0, 0.35))',
          backfaceVisibility: 'hidden',
        },
      }
    },
  },
  {
    id: 'slide',
    label: 'Slide',
    description: 'Flat horizontal slide, newspaper feel.',
    build: (direction, duration) => {
      const transition = `transform ${duration}ms ${easeSlide}, opacity ${duration}ms ease-in-out`
      return {
        initial: {
          transformOrigin: 'center center',
          transition,
          transform: 'translateX(0%)',
          opacity: 1,
          boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.4)',
          backfaceVisibility: 'visible',
        },
        final: {
          transformOrigin: 'center center',
          transition,
          transform: direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)',
          opacity: 0,
          boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.4)',
          backfaceVisibility: 'visible',
        },
      }
    },
  },
  {
    id: 'fade',
    label: 'Fade',
    description: 'Opacity crossfade with no movement.',
    build: (_direction, duration) => {
      const transition = `opacity ${duration}ms ease-in-out`
      return {
        initial: {
          transformOrigin: 'center center',
          transition,
          transform: restingTransform,
          opacity: 1,
          backfaceVisibility: 'visible',
        },
        final: {
          transformOrigin: 'center center',
          transition,
          transform: restingTransform,
          opacity: 0,
          backfaceVisibility: 'visible',
        },
      }
    },
  },
  {
    id: 'tilt',
    label: 'Book Tilt',
    description: 'Pages lift and tilt off the table.',
    build: (direction, duration) => {
      const transformOrigin = direction === 'forward' ? 'left center' : 'right center'
      const transition = `transform ${duration}ms ${easeTilt}, opacity ${duration}ms ease-in-out`
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          boxShadow: '0 30px 50px -20px rgba(0, 0, 0, 0.35)',
          backfaceVisibility: 'hidden',
        },
        final: {
          transformOrigin,
          transition,
          transform: direction === 'forward'
            ? 'perspective(1800px) rotateX(-10deg) rotateY(-150deg) scale(0.92)'
            : 'perspective(1800px) rotateX(-10deg) rotateY(150deg) scale(0.92)',
          opacity: 0,
          boxShadow: '0 40px 60px -20px rgba(0, 0, 0, 0.5)',
          backfaceVisibility: 'hidden',
        },
      }
    },
  },
]

export const FLIP_PRESET_LIST: ReadonlyArray<FlipPreset> = FLIP_PRESETS
export const DEFAULT_FLIP_PRESET: FlipPresetId = 'classic'
export const REDUCED_MOTION_PRESET: FlipPresetId = 'fade'

const PRESET_MAP: Record<FlipPresetId, FlipPreset> = FLIP_PRESETS.reduce(
  (acc, preset) => ({ ...acc, [preset.id]: preset }),
  {} as Record<FlipPresetId, FlipPreset>,
)

export const getFlipPreset = (id: FlipPresetId): FlipPreset =>
  PRESET_MAP[id] ?? PRESET_MAP[DEFAULT_FLIP_PRESET]

export const isFlipPresetId = (value: unknown): value is FlipPresetId =>
  typeof value === 'string' && value in PRESET_MAP
