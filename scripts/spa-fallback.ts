import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export function copySpaFallback(outDir: string) {
  const indexPath = resolve(outDir, 'index.html')
  const fallbackPath = resolve(outDir, '404.html')

  if (!existsSync(indexPath)) {
    throw new Error('spa-fallback: index.html not found in output directory')
  }

  copyFileSync(indexPath, fallbackPath)
}

/**
 * GitHub Pages serves 404.html for unknown paths. Copy index.html so client
 * routes (/v1, /v2, /book/:id) work on direct navigation and refresh.
 */
export function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    apply: 'build',
    closeBundle() {
      copySpaFallback(resolve(process.cwd(), 'dist'))
    },
  }
}
