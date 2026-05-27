import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { copySpaFallback } from '../../scripts/spa-fallback'

describe('copySpaFallback', () => {
  it('copies index.html to 404.html in the output directory', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'spa-fallback-'))
    writeFileSync(join(outDir, 'index.html'), '<!doctype html><title>app</title>')

    copySpaFallback(outDir)

    expect(readFileSync(join(outDir, '404.html'), 'utf8')).toBe(
      '<!doctype html><title>app</title>',
    )
  })

  it('throws when index.html is missing', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'spa-fallback-'))

    expect(() => copySpaFallback(outDir)).toThrow(/index\.html not found/)
  })
})
