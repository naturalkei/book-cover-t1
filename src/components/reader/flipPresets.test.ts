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

  it('every preset.build() returns a CSS object with transition and transform-origin', () => {
    for (const preset of FLIP_PRESET_LIST) {
      const styleF = preset.build('forward', 700)
      const styleB = preset.build('backward', 700)
      expect(styleF.transition).toBeTypeOf('string')
      expect(styleB.transition).toBeTypeOf('string')
      expect(styleF.transformOrigin).toBeTypeOf('string')
      expect(styleB.transformOrigin).toBeTypeOf('string')
    }
  })

  it('fade preset declares transition opacity only (no transform)', () => {
    const fade = FLIP_PRESET_LIST.find(p => p.id === 'fade')
    const style = fade!.build('forward', 700)
    expect(style.transition).toContain('opacity')
    expect(style.transition).not.toContain('transform')
    expect(style.transform).toBe('none')
  })

  it('classic preset uses rotateY transforms with mirrored origins', () => {
    const classic = FLIP_PRESET_LIST.find(p => p.id === 'classic')
    expect(String(classic!.build('forward', 700).transform)).toContain('rotateY(-180deg)')
    expect(String(classic!.build('backward', 700).transform)).toContain('rotateY(180deg)')
    expect(classic!.build('forward', 700).transformOrigin).toBe('left center')
    expect(classic!.build('backward', 700).transformOrigin).toBe('right center')
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
