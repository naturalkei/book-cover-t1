import { describe, expect, it } from 'vitest'

import {
  DEFAULT_FLIP_PRESET,
  FLIP_PRESET_LIST,
  getFlipPreset,
  isFlipPresetId,
  REDUCED_MOTION_PRESET,
} from './flipPresets'

describe('flipPresets registry', () => {
  it('exposes exactly five presets', () => {
    expect(FLIP_PRESET_LIST).toHaveLength(5)
  })

  it('has the expected canonical ids', () => {
    expect(FLIP_PRESET_LIST.map(p => p.id)).toEqual([
      'classic',
      'curl',
      'slide',
      'fade',
      'tilt',
    ])
  })

  it('defaults to classic and uses fade for reduced motion', () => {
    expect(DEFAULT_FLIP_PRESET).toBe('classic')
    expect(REDUCED_MOTION_PRESET).toBe('fade')
  })

  it('every preset declares a label and a description', () => {
    for (const preset of FLIP_PRESET_LIST) {
      expect(preset.label.length).toBeGreaterThan(0)
      expect(preset.description.length).toBeGreaterThan(0)
    }
  })

  it('every preset.build() returns initial + final frames with matching transition strings', () => {
    for (const preset of FLIP_PRESET_LIST) {
      for (const direction of ['forward', 'backward'] as const) {
        const { initial, final } = preset.build(direction, 700)
        expect(initial.transition).toBeTypeOf('string')
        expect(initial.transition).toEqual(final.transition)
        expect(initial.transformOrigin).toEqual(final.transformOrigin)
      }
    }
  })

  it('every preset.initial has opacity 1 and final has opacity 0 (so a real from-to transition exists)', () => {
    for (const preset of FLIP_PRESET_LIST) {
      const { initial, final } = preset.build('forward', 700)
      expect(initial.opacity).toBe(1)
      expect(final.opacity).toBe(0)
    }
  })

  it('fade preset declares opacity-only transition with identity transforms in both frames', () => {
    const fade = FLIP_PRESET_LIST.find(p => p.id === 'fade')!
    const { initial, final } = fade.build('forward', 700)
    expect(initial.transition).toContain('opacity')
    expect(initial.transition).not.toContain('transform')
    expect(initial.transform).toBe('none')
    expect(final.transform).toBe('none')
  })

  it('classic preset rests at no transform and resolves to rotateY in the final frame', () => {
    const classic = FLIP_PRESET_LIST.find(p => p.id === 'classic')!
    const forward = classic.build('forward', 700)
    const backward = classic.build('backward', 700)
    expect(forward.initial.transform).toBe('none')
    expect(String(forward.final.transform)).toContain('rotateY(-180deg)')
    expect(String(backward.final.transform)).toContain('rotateY(180deg)')
    expect(forward.final.transformOrigin).toBe('left center')
    expect(backward.final.transformOrigin).toBe('right center')
  })

  it('slide preset rests at translateX 0 and slides off-screen in the final frame', () => {
    const slide = FLIP_PRESET_LIST.find(p => p.id === 'slide')!
    const { initial, final } = slide.build('forward', 700)
    expect(initial.transform).toBe('translateX(0%)')
    expect(final.transform).toBe('translateX(-100%)')
  })

  it('spread-mode rotational presets pivot at the spine and keep the leaf opaque (so the back face shows)', () => {
    const classic = FLIP_PRESET_LIST.find(p => p.id === 'classic')!
    const forward = classic.build('forward', 700, 'spread')
    expect(forward.initial.transformOrigin).toBe('left center')
    expect(forward.final.transformOrigin).toBe('left center')
    expect(String(forward.final.transform)).toContain('rotateY(-180deg)')
    expect(forward.final.opacity).toBe(1)

    const backward = classic.build('backward', 700, 'spread')
    expect(backward.initial.transformOrigin).toBe('right center')
    expect(String(backward.final.transform)).toContain('rotateY(180deg)')
  })

  it('spread-mode slide preset slides the leaf off the flipping side (not toward the spine)', () => {
    const slide = FLIP_PRESET_LIST.find(p => p.id === 'slide')!
    const forward = slide.build('forward', 700, 'spread')
    expect(forward.final.transform).toBe('translateX(110%)')
    const backward = slide.build('backward', 700, 'spread')
    expect(backward.final.transform).toBe('translateX(-110%)')
  })

  it('getFlipPreset returns the requested entry and falls back to default for unknown ids', () => {
    expect(getFlipPreset('curl').id).toBe('curl')
    // @ts-expect-error — exercising the fallback for an unknown id
    expect(getFlipPreset('mystery').id).toBe('classic')
  })

  it('isFlipPresetId guards string inputs', () => {
    expect(isFlipPresetId('curl')).toBe(true)
    expect(isFlipPresetId('mystery')).toBe(false)
    expect(isFlipPresetId(undefined)).toBe(false)
    expect(isFlipPresetId(42)).toBe(false)
  })
})
