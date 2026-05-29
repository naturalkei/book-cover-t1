import { describe, expect, it } from 'vitest'

import {
  DEFAULT_FLIP_PRESET,
  FlipPresetList,
  getFlipPreset,
  isFlipPresetId,
  REDUCED_MOTION_PRESET,
} from './flip-presets'

describe('flipPresets registry', () => {
  it('exposes exactly five presets', () => {
    expect(FlipPresetList).toHaveLength(5)
  })

  it('has the expected canonical ids', () => {
    expect(FlipPresetList.map(p => p.id)).toEqual([
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
    for (const preset of FlipPresetList) {
      expect(preset.label.length).toBeGreaterThan(0)
      expect(preset.description.length).toBeGreaterThan(0)
    }
  })

  it('every preset.build() returns initial + final frames with matching transition strings', () => {
    for (const preset of FlipPresetList) {
      for (const direction of ['forward', 'backward'] as const) {
        const { initial, final } = preset.build(direction, 700)
        expect(initial.transition).toBeTypeOf('string')
        expect(initial.transition).toEqual(final.transition)
        expect(initial.transformOrigin).toEqual(final.transformOrigin)
      }
    }
  })

  it('single-mode classic and curl stay opaque at final (backface culling hides the turned leaf)', () => {
    for (const id of ['classic', 'curl'] as const) {
      const preset = FlipPresetList.find(p => p.id === id)!
      const { final } = preset.build('forward', 700, 'single')
      expect(final.opacity).toBe(1)
    }
  })

  it('opacity-based presets still fade to 0 in single mode', () => {
    for (const id of ['slide', 'fade', 'tilt'] as const) {
      const preset = FlipPresetList.find(p => p.id === id)!
      const { final } = preset.build('forward', 700, 'single')
      expect(final.opacity).toBe(0)
    }
  })

  it('fade preset declares opacity-only transition with identity transforms in both frames', () => {
    const fade = FlipPresetList.find(p => p.id === 'fade')!
    const { initial, final } = fade.build('forward', 700)
    expect(initial.transition).toContain('opacity')
    expect(initial.transition).not.toContain('transform')
    expect(initial.transform).toBe('none')
    expect(final.transform).toBe('none')
  })

  it('classic preset rests flat and resolves to a paper-like rotateY arc in the final frame', () => {
    const classic = FlipPresetList.find(p => p.id === 'classic')!
    const forward = classic.build('forward', 700)
    const backward = classic.build('backward', 700)
    expect(String(forward.initial.transform)).toBe('rotateY(0deg)')
    expect(String(forward.final.transform)).toBe('rotateY(-180deg)')
    expect(String(forward.final.transform)).not.toMatch(/rotateX/)
    expect(String(backward.final.transform)).toBe('rotateY(180deg)')
    expect(forward.final.transformOrigin).toBe('left center')
    expect(backward.final.transformOrigin).toBe('right center')
    expect(forward.initial.boxShadow).toEqual(forward.final.boxShadow)
    expect(String(forward.initial.transform)).not.toEqual(String(forward.final.transform))
  })

  it('slide preset rests at translateX 0 and slides off-screen in the final frame', () => {
    const slide = FlipPresetList.find(p => p.id === 'slide')!
    const { initial, final } = slide.build('forward', 700)
    expect(initial.transform).toBe('translateX(0%)')
    expect(final.transform).toBe('translateX(-100%)')
  })

  it('spread-mode classic and curl keep leaf shadow/filter constant across phases', () => {
    const classic = FlipPresetList.find(p => p.id === 'classic')!
    const classicSpread = classic.build('forward', 700, 'spread')
    expect(classicSpread.initial.boxShadow).toEqual(classicSpread.final.boxShadow)

    const curl = FlipPresetList.find(p => p.id === 'curl')!
    const curlSpread = curl.build('forward', 700, 'spread')
    expect(curlSpread.initial.filter).toEqual(curlSpread.final.filter)
  })

  it('classic preset keeps boxShadow constant in single mode (transform-only motion)', () => {
    const classic = FlipPresetList.find(p => p.id === 'classic')!
    const single = classic.build('forward', 700, 'single')
    expect(single.initial.boxShadow).toEqual(single.final.boxShadow)
    expect(single.initial.transition).not.toContain('box-shadow')
  })

  it('spread-mode rotational presets pivot at the spine and keep the leaf opaque (so the back face shows)', () => {
    const classic = FlipPresetList.find(p => p.id === 'classic')!
    const forward = classic.build('forward', 700, 'spread')
    expect(forward.initial.transformOrigin).toBe('left center')
    expect(forward.final.transformOrigin).toBe('left center')
    expect(String(forward.final.transform)).toContain('rotateY(-180deg)')
    expect(forward.final.opacity).toBe(1)

    const backward = classic.build('backward', 700, 'spread')
    expect(backward.initial.transformOrigin).toBe('right center')
    expect(String(backward.final.transform)).toContain('rotateY(180deg)')
  })

  it('spread-mode tilt does not scale the leaf — the static layer stays at scale 1, so any scale change would read as shrink-then-grow at cleanup (#50)', () => {
    const tilt = FlipPresetList.find(p => p.id === 'tilt')!
    const forward = tilt.build('forward', 700, 'spread')
    const backward = tilt.build('backward', 700, 'spread')
    expect(String(forward.final.transform)).not.toMatch(/scale\(/)
    expect(String(backward.final.transform)).not.toMatch(/scale\(/)
    expect(String(forward.final.transform)).toContain('rotateX(-6deg)')
  })

  it('single-mode tilt keeps its scale(0.92) lift-off effect (only spread-mode is desaturated)', () => {
    const tilt = FlipPresetList.find(p => p.id === 'tilt')!
    const single = tilt.build('forward', 700)
    expect(String(single.final.transform)).toContain('scale(0.92)')
  })

  it('spread-mode classic and curl also keep scale unchanged so the leaf does not pulse', () => {
    for (const id of ['classic', 'curl'] as const) {
      const preset = FlipPresetList.find(p => p.id === id)!
      const forward = preset.build('forward', 700, 'spread')
      const backward = preset.build('backward', 700, 'spread')
      expect(String(forward.final.transform)).not.toMatch(/scale\(/)
      expect(String(backward.final.transform)).not.toMatch(/scale\(/)
    }
  })

  it('spread-mode slide preset slides the leaf off the flipping side (not toward the spine)', () => {
    const slide = FlipPresetList.find(p => p.id === 'slide')!
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
