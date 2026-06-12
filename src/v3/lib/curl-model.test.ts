import { describe, expect, test } from 'vitest'

import {
  clampUnit,
  CURL_PROGRESS_CHECKPOINTS,
  DEFAULT_CURL_MODEL_CONFIG,
  easePaperProgress,
  sampleCurl,
  sampleGutterLighting,
} from './curl-model'

describe('v3 curl model', () => {
  test('clamps progress and edge coordinates to the unit interval', () => {
    expect(clampUnit(-1)).toBe(0)
    expect(clampUnit(2)).toBe(1)
    expect(sampleCurl(-1, -1, 'forward')).toMatchObject({ progress: 0, u: 0 })
    expect(sampleCurl(2, 2, 'forward')).toMatchObject({ progress: 1, u: 1 })
  })

  test('converges to flat, stable endpoint states', () => {
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      const start = sampleCurl(u, 0, 'forward')
      const end = sampleCurl(u, 1, 'forward')

      expect(start.angle).toBeCloseTo(0)
      expect(start.lift).toBeCloseTo(0)
      expect(start.radius).toBeCloseTo(DEFAULT_CURL_MODEL_CONFIG.maxRadius)
      expect(end.angle).toBeCloseTo(-Math.PI)
      expect(end.lift).toBeCloseTo(0)
      expect(end.radius).toBeCloseTo(DEFAULT_CURL_MODEL_CONFIG.maxRadius)
    }
  })

  test('lets the free edge lead the spine through the middle of the turn', () => {
    const spine = sampleCurl(0, 0.5, 'forward')
    const freeEdge = sampleCurl(1, 0.5, 'forward')

    expect(Math.abs(freeEdge.angle)).toBeGreaterThan(Math.abs(spine.angle))
    expect(freeEdge.angle - spine.angle).toBeCloseTo(
      -DEFAULT_CURL_MODEL_CONFIG.leadRadians,
    )
  })

  test('mirrors geometry for forward and backward directions', () => {
    for (const progress of CURL_PROGRESS_CHECKPOINTS) {
      const forward = sampleCurl(0.7, progress, 'forward')
      const backward = sampleCurl(0.7, progress, 'backward')

      expect(forward.angle).toBeCloseTo(-backward.angle)
      expect(forward.radius).toBeCloseTo(backward.radius)
      expect(forward.lift).toBeCloseTo(backward.lift)
    }
  })

  test('uses monotonic eased progress for commanded turns', () => {
    const samples = CURL_PROGRESS_CHECKPOINTS.map(easePaperProgress)

    expect(samples[0]).toBe(0)
    expect(samples[samples.length - 1]).toBe(1)
    expect(samples).toEqual([...samples].sort((a, b) => a - b))
  })
})

describe('v3 gutter lighting model', () => {
  test('is symmetric around the middle of a flip', () => {
    const quarter = sampleGutterLighting(0.25)
    const threeQuarter = sampleGutterLighting(0.75)

    expect(quarter.creaseAo).toBeCloseTo(threeQuarter.creaseAo)
    expect(quarter.castOpacity).toBeCloseTo(threeQuarter.castOpacity)
    expect(quarter.castWidth).toBeCloseTo(threeQuarter.castWidth)
    expect(quarter.ridgeLight).toBeCloseTo(threeQuarter.ridgeLight)
  })

  test('peaks at the midpoint and returns to stable endpoints', () => {
    const start = sampleGutterLighting(0)
    const middle = sampleGutterLighting(0.5)
    const end = sampleGutterLighting(1)

    expect(middle.creaseAo).toBeGreaterThan(start.creaseAo)
    expect(middle.castOpacity).toBeGreaterThan(start.castOpacity)
    expect(middle.castWidth).toBeGreaterThan(start.castWidth)
    expect(start.creaseAo).toBeCloseTo(end.creaseAo)
    expect(start.castOpacity).toBeCloseTo(end.castOpacity)
    expect(start.castWidth).toBeCloseTo(end.castWidth)
    expect(start.ridgeLight).toBeCloseTo(end.ridgeLight)
  })

  test('changes continuously across animation frames', () => {
    const samples = Array.from({ length: 61 }, (_, index) =>
      sampleGutterLighting(index / 60))

    for (let index = 1; index < samples.length; index += 1) {
      expect(Math.abs(samples[index].creaseAo - samples[index - 1].creaseAo)).toBeLessThan(0.02)
      expect(Math.abs(samples[index].castOpacity - samples[index - 1].castOpacity)).toBeLessThan(0.08)
      expect(Math.abs(samples[index].castWidth - samples[index - 1].castWidth)).toBeLessThan(0.2)
      expect(Math.abs(samples[index].ridgeLight - samples[index - 1].ridgeLight)).toBeLessThan(0.02)
    }
  })
})
