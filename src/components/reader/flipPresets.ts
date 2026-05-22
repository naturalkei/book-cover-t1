import type { CSSProperties } from 'react'

import type { ViewMode } from '@/hooks/useViewMode'

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
  build: (direction: FlipDirection, durationMs: number, mode?: ViewMode) => FlipFrames
}

const easeFlip = 'cubic-bezier(0.2, 0.7, 0.2, 1)'
const easeCurl = 'cubic-bezier(0.32, 0, 0.32, 1)'
const easeSlide = 'cubic-bezier(0.3, 0, 0.2, 1)'
const easeTilt = 'cubic-bezier(0.4, 0.05, 0.2, 1)'

const restingTransform = 'none'

const spineOrigin = (direction: FlipDirection): 'left center' | 'right center' =>
  direction === 'forward' ? 'left center' : 'right center'

const FLIP_PRESETS: FlipPreset[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Pure 3D rotateY page turn.',
    build: (direction, duration, mode = 'single') => {
      const transformOrigin = spineOrigin(direction)
      const transition = `transform ${duration}ms ${easeFlip}, opacity ${duration}ms ease-in-out`
      const finalRotation = direction === 'forward' ? 'rotateY(-180deg)' : 'rotateY(180deg)'
      const shadow = mode === 'spread'
        ? '0 18px 40px -16px rgba(0, 0, 0, 0.5)'
        : '0 30px 60px -20px rgba(0, 0, 0, 0.45)'
      const singleFace = mode === 'single' ? { backfaceVisibility: 'hidden' as const } : {}
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          boxShadow: shadow,
          ...singleFace,
        },
        final: {
          transformOrigin,
          transition,
          transform: finalRotation,
          opacity: mode === 'spread' ? 1 : 0,
          boxShadow: shadow,
          ...singleFace,
        },
      }
    },
  },
  {
    id: 'curl',
    label: 'Curl',
    description: 'Soft paper curl with a lifted corner.',
    build: (direction, duration, mode = 'single') => {
      const transformOrigin = spineOrigin(direction)
      const transition = `transform ${duration}ms ${easeCurl}, opacity ${duration}ms ease-in-out, filter ${duration}ms ease-in-out`
      const finalTransform = mode === 'spread'
        ? (direction === 'forward'
          ? 'perspective(1600px) rotateY(-178deg)'
          : 'perspective(1600px) rotateY(178deg)')
        : (direction === 'forward'
          ? 'perspective(1600px) rotateY(-160deg) translateX(-6%) skewY(-1deg)'
          : 'perspective(1600px) rotateY(160deg) translateX(6%) skewY(1deg)')
      const singleFace = mode === 'single' ? { backfaceVisibility: 'hidden' as const } : {}
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15))',
          ...singleFace,
        },
        final: {
          transformOrigin,
          transition,
          transform: finalTransform,
          opacity: mode === 'spread' ? 1 : 0,
          filter: 'drop-shadow(0 24px 24px rgba(0, 0, 0, 0.35))',
          ...singleFace,
        },
      }
    },
  },
  {
    id: 'slide',
    label: 'Slide',
    description: 'Flat horizontal slide, newspaper feel.',
    build: (direction, duration, mode = 'single') => {
      const transition = `transform ${duration}ms ${easeSlide}, opacity ${duration}ms ease-in-out`
      const finalTransform = mode === 'spread'
        ? (direction === 'forward' ? 'translateX(110%)' : 'translateX(-110%)')
        : (direction === 'forward' ? 'translateX(-100%)' : 'translateX(100%)')
      return {
        initial: {
          transformOrigin: 'center center',
          transition,
          transform: 'translateX(0%)',
          opacity: 1,
          boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.4)',
        },
        final: {
          transformOrigin: 'center center',
          transition,
          transform: finalTransform,
          opacity: 0,
          boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.4)',
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
        },
        final: {
          transformOrigin: 'center center',
          transition,
          transform: restingTransform,
          opacity: 0,
        },
      }
    },
  },
  {
    id: 'tilt',
    label: 'Book Tilt',
    description: 'Pages lift and tilt off the table.',
    build: (direction, duration, mode = 'single') => {
      const transformOrigin = spineOrigin(direction)
      const transition = `transform ${duration}ms ${easeTilt}, opacity ${duration}ms ease-in-out`
      const finalTransform = mode === 'spread'
        ? (direction === 'forward'
          ? 'perspective(1800px) rotateX(-6deg) rotateY(-178deg) scale(0.96)'
          : 'perspective(1800px) rotateX(-6deg) rotateY(178deg) scale(0.96)')
        : (direction === 'forward'
          ? 'perspective(1800px) rotateX(-10deg) rotateY(-150deg) scale(0.92)'
          : 'perspective(1800px) rotateX(-10deg) rotateY(150deg) scale(0.92)')
      const singleFace = mode === 'single' ? { backfaceVisibility: 'hidden' as const } : {}
      return {
        initial: {
          transformOrigin,
          transition,
          transform: restingTransform,
          opacity: 1,
          boxShadow: '0 30px 50px -20px rgba(0, 0, 0, 0.35)',
          ...singleFace,
        },
        final: {
          transformOrigin,
          transition,
          transform: finalTransform,
          opacity: mode === 'spread' ? 1 : 0,
          boxShadow: '0 40px 60px -20px rgba(0, 0, 0, 0.5)',
          ...singleFace,
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
